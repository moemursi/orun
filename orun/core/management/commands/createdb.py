from sqlalchemy.engine.url import URL, make_url
from sqlalchemy import create_engine

from orun.core.management import commands
from orun.db import connections, DEFAULT_DB_ALIAS


@commands.command('createdb')
@commands.option(
    '--database',
    default=DEFAULT_DB_ALIAS,
    help='Nominates a database to create. Defaults to the "default" database.',
)
def command(database, **options):
    create(database)


def _create_connection(db):
    if isinstance(db, str):
        url = make_url(connections.databases[db]['ENGINE'])
    elif isinstance(db, dict):
        url = make_url(db['ENGINE'])
    else:
        url = db

    db_engine = url.drivername.split('+')[0]
    database = url.database

    if db_engine == 'sqlite':
        return
    elif db_engine == 'postgresql':
        database = 'postgres'
    elif db_engine == 'mssql':
        database = 'master'
    elif db_engine == 'orun.db.backends.oracle':
        database = 'SYSTEM'

    url = URL(url.drivername, url.username, url.password, url.host, url.port, database, url.query)
    return create_engine(url).connect()


def create(db):
    commands.echo('Creating database "%s"' % db)
    url = make_url(connections.databases[db]['ENGINE'])

    if url.drivername == 'sqlite':
        return

    conn = _create_connection(url)

    db_settings = conn.engine.url
    db_engine = conn.engine.name
    db_name = url.database

    if 'postgres' in db_engine:
        conn.connection.set_isolation_level(0)
        conn.execute("""CREATE DATABASE %s ENCODING='UTF-8'""" % db_name)
    elif db_engine == 'mssql':
        conn.autocommit = True
        conn.execute("""CREATE DATABASE %s""" % db_name)
        conn.autocommit = False
    elif db_engine == 'oracle':
        conn.execute('create user %s identified by %s' % (db_settings['USER'], db_settings['PASSWORD']))
        conn.execute('grant all privilege to %s' % db_settings['USER'])

    commands.echo('Database "%s" has been created succesfully' % db)
