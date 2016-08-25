"""
MSSQL backend for orun.

Works with pyodbc with sql server native client.
"""
import datetime
import decimal
import re
import warnings

from orun.conf import settings
from orun.db import utils
from orun.db.backends import utils as backend_utils
from orun.db.backends.base.base import BaseDatabaseWrapper
from orun.db.backends.base.validation import BaseDatabaseValidation
from orun.utils import timezone
from orun.utils.dateparse import (
    parse_date, parse_datetime, parse_duration, parse_time,
)
from orun.utils.encoding import force_text

try:
    import pytz
except ImportError:
    pytz = None

try:
    import pyodbc as Database
except ImportError as exc:
    from orun.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured("Error loading pyodbc module: %s" % exc)

from .client import DatabaseClient
from .creation import DatabaseCreation
from .features import DatabaseFeatures
from .introspection import DatabaseIntrospection
from .operations import DatabaseOperations
from .schema import DatabaseSchemaEditor

DatabaseError = Database.DatabaseError
IntegrityError = Database.IntegrityError


class DatabaseWrapper(BaseDatabaseWrapper):
    vendor = 'mssql'

    data_types = {
        'AutoField': 'int',
        'BigAutoField': 'bigint',
        'BigIntegerField': 'bigint',
        'BinaryField': 'varbinary(max)',
        'BooleanField': 'bit',
        'CharField': 'nvarchar(%(max_length)s)',
        'CommaSeparatedIntegerField': 'nvarchar(%(max_length)s)',
        'DateField': 'date',
        'DateTimeField': 'datetime2',
        'DateTimeOffsetField': 'datetimeoffset',
        'DecimalField': 'decimal(%(max_digits)s, %(decimal_places)s)',
        'DurationField': 'bigint',
        'FileField': 'nvarchar(%(max_length)s)',
        'FilePathField': 'nvarchar(%(max_length)s)',
        'FloatField': 'double precision',
        'GenericIPAddressField': 'nvarchar(39)',
        'IntegerField': 'int',
        'IPAddressField': 'nvarchar(15)',
        'LegacyDateField': 'datetime',
        'LegacyDateTimeField': 'datetime',
        'LegacyTimeField': 'time',
        'NewDateField': 'date',
        'NewDateTimeField': 'datetime2',
        'NewTimeField': 'time',
        'NullBooleanField': 'bit',
        'OneToOneField': 'int',
        'PositiveIntegerField': 'int',
        'PositiveSmallIntegerField': 'smallint',
        'SlugField': 'nvarchar(%(max_length)s)',
        'SmallIntegerField': 'smallint',
        'TextField': 'nvarchar(max)',
        'TimeField': 'time',
        'URLField': 'nvarchar(%(max_length)s)',
        'UUIDField': 'uniqueidentifier',
    }
    data_types_suffix = {
        'AutoField': 'IDENTITY (1, 1)',
        'BigAutoField': 'IDENTITY (1, 1)',
    }
    operators = {
        'exact': '= %s',
        'iexact': "LIKE %s ESCAPE '\\'",
        'contains': "LIKE %s ESCAPE '\\'",
        'icontains': "LIKE %s ESCAPE '\\'",
        'regex': 'REGEXP %s',
        'iregex': "REGEXP '(?i)' || %s",
        'gt': '> %s',
        'gte': '>= %s',
        'lt': '< %s',
        'lte': '<= %s',
        'startswith': "LIKE %s ESCAPE '\\'",
        'endswith': "LIKE %s ESCAPE '\\'",
        'istartswith': "LIKE %s ESCAPE '\\'",
        'iendswith': "LIKE %s ESCAPE '\\'",
    }

    pattern_esc = r"REPLACE(REPLACE(REPLACE({}, '\', '\\'), '%%', '\%%'), '_', '\_')"
    pattern_ops = {
        'contains': r"LIKE '%%' || {} || '%%' ESCAPE '\'",
        'icontains': r"LIKE '%%' || UPPER({}) || '%%' ESCAPE '\'",
        'startswith': r"LIKE {} || '%%' ESCAPE '\'",
        'istartswith': r"LIKE UPPER({}) || '%%' ESCAPE '\'",
        'endswith': r"LIKE '%%' || {} ESCAPE '\'",
        'iendswith': r"LIKE '%%' || UPPER({}) ESCAPE '\'",
    }

    Database = Database
    SchemaEditorClass = DatabaseSchemaEditor

    def __init__(self, *args, **kwargs):
        super(DatabaseWrapper, self).__init__(*args, **kwargs)

        self.features = DatabaseFeatures(self)
        self.ops = DatabaseOperations(self)
        self.client = DatabaseClient(self)
        self.creation = DatabaseCreation(self)
        self.introspection = DatabaseIntrospection(self)
        self.validation = BaseDatabaseValidation(self)

    def get_connection_params(self):
        settings_dict = self.settings_dict
        if settings_dict['NAME'] == '':
            raise ImproperlyConfigured(
                "settings.DATABASES is improperly configured. "
                "Please supply the NAME value.")
        conn_params = {
            'database': settings_dict['NAME'] or 'master',
        }
        conn_params.update(settings_dict['OPTIONS'])
        conn_params.pop('isolation_level', None)
        conn_params.setdefault('driver', 'SQL Server Native Client 13.0')
        if settings_dict['USER']:
            conn_params['user'] = settings_dict['USER']
        if settings_dict['PASSWORD']:
            conn_params['password'] = settings_dict['PASSWORD']
        if settings_dict['HOST']:
            conn_params['host'] = settings_dict['HOST']
        if settings_dict['PORT']:
            conn_params['port'] = settings_dict['PORT']
        return conn_params

    def get_new_connection(self, conn_params):
        conn_str = """DRIVER={%(driver)s};SERVER=%(host)s;DATABASE=%(database)s;UID=%(user)s;PWD=%(password)s""" % conn_params
        print('sql server connection string', conn_str)
        conn = Database.connect(conn_str)
        return conn

    def init_connection_state(self):
        pass

    def create_cursor(self):
        return self.connection.cursor()

    def close(self):
        BaseDatabaseWrapper.close(self)

    def _savepoint_allowed(self):
        pass

    def _set_autocommit(self, autocommit):
        self.connection.autocommit = autocommit

    def check_constraints(self, table_names=None):
        """
        To check constraints, we set constraints to immediate. Then, when, we're done we must ensure they
        are returned to deferred.
        """
        cursor = self.cursor()

    def is_usable(self):
        try:
            self.connection.cursor().execute("SELECT 1")
        except Database.Error:
            return False
        else:
            return True

    def _start_transaction_under_autocommit(self):
        """
        Start a transaction explicitly in autocommit mode.

        Staying in autocommit mode works around a bug of sqlite3 that breaks
        savepoints when autocommit is disabled.
        """
        self.cursor().execute("BEGIN")
