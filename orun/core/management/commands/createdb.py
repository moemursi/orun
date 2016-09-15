from orun.core.management import commands
from orun.db import connections, DEFAULT_DB_ALIAS
from orun.db.utils import load_backend


@commands.command('createdb')
@commands.option(
    '--database',
    default=DEFAULT_DB_ALIAS,
    help='Nominates a database to create. Defaults to the "default" database.',
)
def command(database, **options):
    create(database)


def _create_connection(db):
    connection = connections[db]
    db_settings = connection.settings_dict
    db_engine = db_settings['ENGINE']
    backend = load_backend(db_engine)

    if db_engine == 'orun.db.backends.sqlite3':
        import sqlite3

        return sqlite3.connect(db_settings['NAME'])
    elif 'postgres' in db_engine:
        return backend.psycopg2.connect(
            "host='%s'  dbname='postgres' user='%s' password='%s'" %
            (db_settings['HOST'], db_settings['USER'], db_settings['PASSWORD'])
        )
    elif db_engine == 'orun.db.backends.mssql':
        conn_params = connection.get_connection_params()
        conn_params['database'] = 'master'
        return backend.Database.connect(
            """DRIVER={%(driver)s};SERVER=%(host)s;DATABASE=%(database)s;UID=%(user)s;PWD=%(password)s""" % conn_params
        )
    elif db_engine == 'orun.db.backends.oracle':
        import cx_Oracle

        conn = cx_Oracle.connect('SYSTEM', db_settings['PASSWORD'], 'localhost/master')
        return conn


def create(db):
    commands.echo('Creating database "%s"' % db)
    connection = connections[db]
    db_settings = connection.settings_dict
    db_engine = db_settings['ENGINE']
    db_name = db_settings['NAME']
    db_engine = db_engine.split('.')[-1]

    conn = _create_connection(db)

    if db_engine == 'sqlite3':
        pass
    elif 'postgres' in db_engine:
        conn.autocommit = True
        conn.cursor().execute('''CREATE DATABASE %s ENCODING='UTF-8' ''' % db_name)
    elif db_engine == 'mssql':
        conn.autocommit = True
        conn.cursor().execute('''CREATE DATABASE %s''' % db_name)
        conn.autocommit = False
    elif db_engine == 'oracle':
        conn.cursor().execute('create user %s identified by %s' % (db_settings['USER'], db_settings['PASSWORD']))
        conn.cursor().execute('grant all privilege to %s' % db_settings['USER'])

    commands.echo('Database "%s" has been created succesfully' % db)
