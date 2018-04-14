"""
Execute SQL File Script
"""
import os

from sqlalchemy.engine.url import make_url
from orun.db import connections, DEFAULT_DB_ALIAS


def Deserializer(stream_or_string, app, **options):
    """
    Execute a SQL File Script using the native command line interface
    """
    db_alias = options.get('database', DEFAULT_DB_ALIAS)
    database = connections.databases[db_alias]
    url = make_url(database['ENGINE'])
    db_engine = url.drivername.split('+')[0]
    user_name = url.username
    host = url.host
    db_name = url.database
    pwd = url.password
    if db_engine == 'mssql':
        if user_name:
            additional_params = ''
            if os.name == 'nt':
                additional_params = '-f 65001'
            os.system(
                'sqlcmd -U %s -P %s -S %s -d %s -i "%s" %s' %
                (user_name, pwd, host, db_name, stream_or_string.name, additional_params)
            )
        else:
            os.system(
                'sqlcmd -E -S %s -d %s -i "%s" -f 65001' %
                (host, db_name, stream_or_string.name,)
            )
    elif db_engine == 'postgresql':
        connection = connections[db_alias].raw_connection().connection
        with connection.cursor() as cur:
            sql = open(stream_or_string.name, 'r', encoding='utf-8').read()
            cur.execute(sql)
            connection.commit()
