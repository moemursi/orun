from threading import local
from importlib import import_module
import sqlalchemy as sa
from sqlalchemy.exc import DatabaseError
from sqlalchemy.engine.url import URL, make_url
from sqlalchemy.orm import sessionmaker

from orun import env
from orun.core.exceptions import ImproperlyConfigured
from orun.conf import settings
from orun.utils.functional import cached_property
from orun.utils.module_loading import import_string


DEFAULT_DB_ALIAS = 'default'


class Error(Exception):
    pass


class InterfaceError(Error):
    pass


class DataError(DatabaseError):
    pass


class OperationalError(DatabaseError):
    pass


class IntegrityError(DatabaseError):
    pass


class InternalError(DatabaseError):
    pass


class ProgrammingError(DatabaseError):
    pass


class NotSupportedError(DatabaseError):
    pass


class ConnectionDoesNotExist(Exception):
    pass


def get_backend(engine):
    backend = 'orun.db.backends.' + engine + '.base.Backend'
    return import_string(backend)


class ConnectionInfo(object):
    def __init__(self, engine):
        self.engine = engine
        self.in_atomic_block = False
        self.savepoints = []
        self.commit_on_exit = True
        self.needs_rollback = False
        self.closed_in_transaction = False

    def schema_editor(self):
        backend = import_module('orun.db.backends.%s.schema' % self.engine.name)
        return backend.DatabaseSchemaEditor(self.engine)

    @cached_property
    def ops(self):
        backend = import_module('orun.db.backends.%s.operations' % self.engine.name)
        return backend.DatabaseOperations(self.engine)


class ConnectionHandler(object):
    def __init__(self, databases=None):
        """
        databases is an optional dictionary of database definitions (structured
        like settings.DATABASES).
        """
        self._databases = databases
        self._connections = local()

    @cached_property
    def databases(self):
        if self._databases is None:
            self._databases = settings.DATABASES
        if self._databases == {}:
            self._databases = {
                DEFAULT_DB_ALIAS: {
                    'ENGINE': 'sqlite:///:memory:',
                },
            }

        if self._databases[DEFAULT_DB_ALIAS] == {}:
            self._databases[DEFAULT_DB_ALIAS]['ENGINE'] = 'sqlite:///:memory:'

        if DEFAULT_DB_ALIAS not in self._databases:
            raise ImproperlyConfigured("You must define a '%s' database" % DEFAULT_DB_ALIAS)
        return self._databases

    def ensure_defaults(self, alias):
        """
        Puts the defaults into the settings dictionary for a given connection
        where no settings is provided.
        """
        try:
            conn = self.databases[alias]
        except KeyError:
            raise ConnectionDoesNotExist("The connection %s doesn't exist" % alias)

        conn.setdefault('ATOMIC_REQUESTS', True)
        conn.setdefault('AUTOCOMMIT', False)
        conn.setdefault('ENGINE', 'sqlite:///:memory:')
        if not conn['ENGINE']:
            conn['ENGINE'] = 'sqlite:///:memory:'
        conn.setdefault('CONN_MAX_AGE', 0)
        conn.setdefault('OPTIONS', {})
        conn.setdefault('TIME_ZONE', None)

    def prepare_test_settings(self, alias):
        """
        Makes sure the test settings are available in the 'TEST' sub-dictionary.
        """
        try:
            conn = self.databases[alias]
        except KeyError:
            raise ConnectionDoesNotExist("The connection %s doesn't exist" % alias)

        test_settings = conn.setdefault('TEST', {})
        for key in ['CHARSET', 'COLLATION', 'NAME', 'MIRROR']:
            test_settings.setdefault(key, None)

    def __getitem__(self, alias):
        # Get the current database
        if alias == DEFAULT_DB_ALIAS:
            alias = env.DEFAULT_DB_ALIAS
        from orun.db.models.query import Session
        if hasattr(self._connections, alias):
            return getattr(self._connections, alias)

        self.ensure_defaults(alias)
        self.prepare_test_settings(alias)
        db = self.databases[alias]
        if 'url' not in db:
            db['url'] = make_url(db['ENGINE'])
        url = db['url']
        backend = get_backend(url.drivername.split('+')[0])
        conn = backend.create_engine(alias, url)
        conn.session = Session(bind=conn)
        conn.conn_info = ConnectionInfo(conn)
        conn.alias = alias
        setattr(self._connections, alias, conn)
        return conn

    def __setitem__(self, key, value):
        setattr(self._connections, key, value)

    def __delitem__(self, key):
        delattr(self._connections, key)

    def __iter__(self):
        return iter(self.databases)

    def all(self):
        return [self[alias] for alias in self]

    def close_all(self):
        for alias in self:
            try:
                connection = getattr(self._connections, alias)
            except AttributeError:
                continue
            connection.close()
