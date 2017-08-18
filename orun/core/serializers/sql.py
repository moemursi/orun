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
    database = connections.databases[options.get('database', DEFAULT_DB_ALIAS)]
    url = make_url(database['ENGINE'])
    db_engine = url.drivername.split('+')[0]
    user_name = url.username
    host = url.host
    db_name = url.database
    pwd = url.password
    # MSSQL
    if db_engine == 'mssql':
        if user_name:
            os.system(
                'sqlcmd -U %s -P %s -S %s -d %s -i "%s" -f 65001' %
                (user_name, pwd, host, db_name, stream_or_string.name,)
            )
        else:
            os.system(
                'sqlcmd -E -S %s -d %s -i "%s" -f 65001' %
                (host, db_name, stream_or_string.name,)
            )
