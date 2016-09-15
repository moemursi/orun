import os

from orun.core.management import commands
from orun.db import connections
from orun.db import DEFAULT_DB_ALIAS
from .createdb import _create_connection


@commands.command('dropdb')
@commands.option(
    '--database',
    default=DEFAULT_DB_ALIAS,
    help='Nominates a database to drop. Defaults to the "default" database.',
)
def command(database, **options):
    drop(database)


def drop(db):
    connection = connections[db]
    connection.close()
    db_settings = connection.settings_dict
    db_engine = db_settings['ENGINE']
    db_name = db_settings['NAME']

    conn = _create_connection(db)
    commands.echo('Dropping db "%s"' % db_name)

    if db_engine == 'orun.db.backends.sqlite3':
        del conn
        if db_name != ':memory:':
            os.remove(db_name)
    elif db_engine.startswith('postgres'):
        conn.autocommit = True
        try:
            conn.cursor().execute('''DROP DATABASE %s''' % db_name)
        except Exception as e:
            commands.echo(e, err=True)
        conn.autocommit = False
    elif db_engine == 'orun.db.backends.mssql':
        conn.autocommit = True
        try:
            conn.cursor().execute('''DROP DATABASE %s''' % db_name)
        except Exception as e:
            commands.echo(e, err=True)
        conn.autocommit = False
    elif db_engine == 'orun.db.backends.oracle':
        try:
            conn.cursor().execute('DROP USER %s CASCADE' % db_settings['USER'])
        except Exception as e:
            commands.echo(e, err=True)

    commands.echo('Database "%s" has been dropped successfully' % db_name)
