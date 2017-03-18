import time
from collections import OrderedDict
from importlib import import_module

from orun import app as main_app
from orun.apps import apps
from orun.conf import settings
from orun.core.management import commands
from orun.core.management.commands import CommandError
from orun.db import connections, transaction, DEFAULT_DB_ALIAS
from orun.db.migrations.executor import MigrationExecutor
from orun.db.migrations.state import ModelState, ProjectState
from orun.db.migrations.exceptions import AmbiguityError
from orun.db.migrations.autodetector import MigrationAutodetector
#from orun.db import router
from orun.core.management.sql import (
    emit_post_migrate_signal, emit_pre_migrate_signal,
)


@commands.command('migrate', short_help="Updates database schema. Manages both apps with migrations and those without.")
@commands.argument(
    'app_label', nargs=1, required=False,
    #help='App label of an addon to synchronize the state.',
)
@commands.argument(
    'migration_name', nargs=1, required=False,
    #help='Database state will be brought to the state after that '
    #     'migration. Use the name "zero" to unapply all migrations.',
)
@commands.option(
    '--noinput', default=True,
    help='Tells Orun to NOT prompt the user for input of any kind.',
)
@commands.option(
    '--database',
    default=DEFAULT_DB_ALIAS,
    help='Nominates a database to synchronize. Defaults to the "default" database.',
)
@commands.option(
    '--fake',
    help='Mark migrations as run without actually running them.',
)
@commands.option(
    '--fake-initial',
    help='Detect if tables already exist and fake-apply initial migrations if so. Make sure '
         'that the current database schema matches your initial migration before using this '
         'flag. Orun will only check for an existing table name.',
)
@commands.option(
    '--run-syncdb',
    help='Creates tables for apps without migrations.',
)
def command(app_label, migration_name, noinput, database, fake, fake_initial, run_syncdb, **options):
    migrate(app_label, migration_name, noinput, database, fake, fake_initial, run_syncdb, **options)


def migrate(app_label, migration_name, noinput, database, fake, fake_initial, run_syncdb, **options):
    migrate = Migrate(app_label, migration_name, noinput, database, fake, fake_initial, run_syncdb, **options)
    migrate.handle()


class Migrate(object):
    def __init__(self, app_label, migration_name, noinput, database, fake, fake_initial, run_syncdb, **options):
        self.app_label = app_label
        self.migration_name = migration_name
        self.interactive = not noinput
        self.database = database
        self.fake = fake
        self.fake_initial = fake_initial
        self.run_syncdb = run_syncdb
        self.verbosity = options['verbosity']

    def handle(self, *args, **options):
        # Get the database we're operating from
        db = self.database
        connection = connections[db]

        # Hook for backends needing any database preparation
        #connection.prepare_database()
        # Work out which apps have migrations and which do not
        executor = MigrationExecutor(connection, self.migration_progress_callback)

        # Before anything else, see if there's conflicting apps and drop out
        # hard if there are any
        conflicts = executor.loader.detect_conflicts()
        if conflicts:
            name_str = "; ".join(
                "%s in %s" % (", ".join(names), app)
                for app, names in conflicts.items()
            )
            raise CommandError(
                "Conflicting migrations detected; multiple leaf nodes in the "
                "migration graph: (%s).\nTo fix them run "
                "'python manage.py makemigrations --merge'" % name_str
            )

        # If they supplied command line arguments, work out what they mean.
        target_app_labels_only = True
        if self.app_label and self.migration_name:
            app_label, migration_name = self.app_label, self.migration_name
            if app_label not in executor.loader.migrated_apps:
                raise CommandError(
                    "App '%s' does not have migrations." % app_label
                )
            if migration_name == "zero":
                targets = [(app_label, None)]
            else:
                try:
                    migration = executor.loader.get_migration_by_prefix(app_label, migration_name)
                except AmbiguityError:
                    raise CommandError(
                        "More than one migration matches '%s' in app '%s'. "
                        "Please be more specific." %
                        (migration_name, app_label)
                    )
                except KeyError:
                    raise CommandError("Cannot find a migration matching '%s' from app '%s'." % (
                        migration_name, app_label))
                targets = [(app_label, migration.name)]
            target_app_labels_only = False
        elif self.app_label:
            app_label = self.app_label
            if app_label not in executor.loader.migrated_apps:
                raise CommandError(
                    "App '%s' does not have migrations." % app_label
                )
            targets = [key for key in executor.loader.graph.leaf_nodes() if key[0] == app_label]
        else:
            targets = executor.loader.graph.leaf_nodes()

        plan = executor.migration_plan(targets)
        run_syncdb = self.run_syncdb and executor.loader.unmigrated_apps

        # Print some useful info
        if self.verbosity >= 1:
            commands.echo(commands.style.MIGRATE_HEADING("Operations to perform:"))
            if run_syncdb:
                commands.echo(
                    commands.style.MIGRATE_LABEL("  Synchronize unmigrated apps: ") +
                    (", ".join(executor.loader.unmigrated_apps))
                )
            if target_app_labels_only:
                commands.echo(
                    commands.style.MIGRATE_LABEL("  Apply all migrations: ") +
                    (", ".join(set(a for a, n in targets)) or "(none)")
                )
            else:
                if targets[0][1] is None:
                    commands.echo(commands.style.MIGRATE_LABEL(
                        "  Unapply all migrations: ") + "%s" % (targets[0][0], )
                    )
                else:
                    commands.echo(commands.style.MIGRATE_LABEL(
                        "  Target specific migration: ") + "%s, from %s"
                        % (targets[0][1], targets[0][0])
                    )

        emit_pre_migrate_signal(self.verbosity, self.interactive, db)

        # Run the syncdb phase.
        if run_syncdb:
            if self.verbosity >= 1:
                commands.echo(commands.style.MIGRATE_HEADING("Synchronizing apps without migrations:"))
            self.sync_apps(connection, executor.loader.unmigrated_apps)

        # Migrate!
        if self.verbosity >= 1:
            commands.echo(commands.style.MIGRATE_HEADING("Running migrations:"))
        if not plan:
            executor.check_replacements()
            if self.verbosity >= 1:
                commands.echo("  No migrations to apply.")
                # If there's changes that aren't in migrations yet, tell them how to fix it.
                autodetector = MigrationAutodetector(
                    executor.loader.project_state(),
                    ProjectState.from_apps(apps),
                )
                changes = autodetector.changes(graph=executor.loader.graph)
                if changes:
                    commands.echo(commands.style.NOTICE(
                        "  Your models have changes that are not yet reflected "
                        "in a migration, and so won't be applied."
                    ))
                    commands.echo(commands.style.NOTICE(
                        "  Run 'manage.py makemigrations' to make new "
                        "migrations, and then re-run 'manage.py migrate' to "
                        "apply them."
                    ))
        else:
            fake = self.fake
            fake_initial = self.fake_initial
            executor.migrate(targets, plan, fake=fake, fake_initial=fake_initial)

        # Send the post_migrate signal, so individual apps can do whatever they need
        # to do at this point.
        emit_post_migrate_signal(self.verbosity, self.interactive, connection.alias)

        # Register models
        ContentType = main_app['sys.model']
        for model in apps.get_models():
            content_types = {
                ct.name: ct
                for ct in ContentType.objects.all()
            }
            to_remove = [
                ct
                for (model_name, ct) in content_types.items()
                if model_name not in main_app.models
            ]

            cts = [
                {'name': model_name, 'object_name': model._meta.object_name, 'object_type': 'system'}
                for (model_name, model) in main_app.models.items()
                if model_name not in content_types
            ]
            if cts:
                ContentType.insert.values(cts)

    def migration_progress_callback(self, action, migration=None, fake=False):
        if self.verbosity >= 1:
            compute_time = self.verbosity > 1
            if action == "apply_start":
                if compute_time:
                    self.start = time.time()
                commands.echo("  Applying %s..." % migration, nl=False)
            elif action == "apply_success":
                elapsed = " (%.3fs)" % (time.time() - self.start) if compute_time else ""
                if fake:
                    commands.echo(commands.style.MIGRATE_SUCCESS(" FAKED" + elapsed))
                else:
                    commands.echo(commands.style.MIGRATE_SUCCESS(" OK" + elapsed))
            elif action == "unapply_start":
                if compute_time:
                    self.start = time.time()
                commands.echo("  Unapplying %s..." % migration, nl=False)
            elif action == "unapply_success":
                elapsed = " (%.3fs)" % (time.time() - self.start) if compute_time else ""
                if fake:
                    commands.echo(commands.style.MIGRATE_SUCCESS(" FAKED" + elapsed))
                else:
                    commands.echo(commands.style.MIGRATE_SUCCESS(" OK" + elapsed))
            elif action == "render_start":
                if compute_time:
                    self.start = time.time()
                commands.echo("  Rendering model states...", nl=False)
            elif action == "render_success":
                elapsed = " (%.3fs)" % (time.time() - self.start) if compute_time else ""
                commands.echo(commands.style.MIGRATE_SUCCESS(" DONE" + elapsed))

    def sync_apps(self, connection, app_labels):
        "Runs the old syncdb-style operation on a list of app_labels."
        cursor = connection.cursor()

        try:
            # Get a list of already installed *models* so that references work right.
            tables = connection.introspection.table_names(cursor)
            created_models = set()

            # Build the manifest of apps and models that are to be synchronized
            all_models = [
                (
                    app_config.label,
                    True,
                    #router.get_migratable_models(app_config, connection.alias, include_auto_created=False)
                 )
                for app_config in apps.get_app_configs()
                if app_config.models_module is not None and app_config.label in app_labels
            ]

            def model_installed(model):
                opts = model._meta
                converter = connection.introspection.table_name_converter
                # Note that if a model is unmanaged we short-circuit and never try to install it
                return not ((converter(opts.db_table) in tables) or
                    (opts.auto_created and converter(opts.auto_created._meta.db_table) in tables))

            manifest = OrderedDict(
                (app_name, list(filter(model_installed, model_list)))
                for app_name, model_list in all_models
            )

            # Create the tables for each model
            if self.verbosity >= 1:
                commands.echo("  Creating tables...")
            with transaction.atomic(using=connection.alias, savepoint=connection.features.can_rollback_ddl):
                deferred_sql = []
                for app_name, model_list in manifest.items():
                    for model in model_list:
                        if not model._meta.can_migrate(connection):
                            continue
                        if self.verbosity >= 3:
                            commands.echo(
                                "    Processing %s.%s model" % (app_name, model._meta.object_name)
                            )
                        with connection.schema_editor() as editor:
                            if self.verbosity >= 1:
                                commands.echo("    Creating table %s" % model._meta.db_table)
                            editor.create_model(model)
                            deferred_sql.extend(editor.deferred_sql)
                            editor.deferred_sql = []
                        created_models.add(model)

                if self.verbosity >= 1:
                    commands.echo("    Running deferred SQL...")
                for statement in deferred_sql:
                    cursor.execute(statement)
        finally:
            cursor.close()

        return created_models
