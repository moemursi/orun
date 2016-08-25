import os
import sys
from unittest import TestCase


class MigrationsTestCase(TestCase):
    def test_writer(self):
        from orun.db import migrations, models, connection
        from orun.db.migrations import writer
        from base import models as base

        class Migration(migrations.Migration):
            operations = [
                migrations.CreateModel(
                    'sys_model',
                    fields=[
                        ('name', models.CharField()),
                        ('description', models.CharField()),
                    ]
                )
            ]

        with connection.schema_editor() as editor:
            mig = Migration('initial', 'test')
            w = writer.MigrationWriter(mig)
            sys.stdout.write(w.as_string().decode())

        from orun.db.migrations.autodetector import MigrationAutodetector
        from orun.db.migrations.loader import MigrationLoader
        from orun.db.migrations.state import ProjectState
        from orun.db.migrations.questioner import NonInteractiveMigrationQuestioner
        from orun.apps import registry

        questioner = NonInteractiveMigrationQuestioner(specified_apps=['base', 'mail', 'product'])
        loader = loader = MigrationLoader(None, ignore_no_migrations=True)

        # Set up autodetector
        autodetector = MigrationAutodetector(
            loader.project_state(),
            ProjectState.from_apps(registry),
            questioner,
        )

        # Detect changes
        changes = autodetector.changes(
            graph=loader.graph,
            trim_to_apps=['base', 'mail', 'product'] or None,
            convert_apps=['base', 'mail', 'product'] or None,
            migration_name=None,
        )
        self.write_migration_files(changes)

    def test_migrate(self):
        pass

    def write_migration_files(self, changes):
        """
        Takes a changes dict and writes them out as migration files.
        """
        from orun.db.migrations.writer import MigrationWriter
        verbosity = 1
        directory_created = {}
        for app_label, app_migrations in changes.items():
            if verbosity >= 1:
                sys.stdout.write("Migrations for '%s':" % app_label + "\n")
            for migration in app_migrations:
                # Describe the migration
                writer = MigrationWriter(migration)
                if verbosity >= 1:
                    # Display a relative path if it's below the current working
                    # directory, or an absolute path otherwise.
                    migration_string = os.path.relpath(writer.path)
                    if migration_string.startswith('..'):
                        migration_string = writer.path
                    sys.stdout.write("  %s:\n" % migration_string)
                    for operation in migration.operations:
                        sys.stdout.write("    - %s\n" % operation.describe())
                if 1:
                    # Write the migrations file to the disk.
                    migrations_directory = os.path.dirname(writer.path)
                    if not directory_created.get(app_label):
                        if not os.path.isdir(migrations_directory):
                            os.mkdir(migrations_directory)
                        init_path = os.path.join(migrations_directory, "__init__.py")
                        if not os.path.isfile(init_path):
                            open(init_path, "w").close()
                        # We just do this once per app
                        directory_created[app_label] = True
                    migration_string = writer.as_string()
                    with open(writer.path, "wb") as fh:
                        fh.write(migration_string)
