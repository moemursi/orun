from orun.db import DEFAULT_DB_ALIAS
from orun.core.management import commands
from orun.core.management.commands import createdb
from orun.core.management.commands import dropdb
from orun.core.management.commands import migrate


@commands.command('recreatedb')
@commands.option(
    '--database',
    default=DEFAULT_DB_ALIAS,
    help='Nominates a database to recreate. Defaults to the "default" database.',
)
def command(database, **options):
    dropdb.drop(database)
    createdb.create(database)
    migrate.migrate(None, None, None, database, None, None, None, **options)
