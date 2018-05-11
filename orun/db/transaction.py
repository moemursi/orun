from functools import wraps
from contextlib import ContextDecorator, contextmanager
from orun.db import (
    DEFAULT_DB_ALIAS, DatabaseError, Error, ProgrammingError, connections,
)


class TransactionManagementError(ProgrammingError):
    """
    This exception is thrown when transaction management is used improperly.
    """
    pass


def get_connection(using=None):
    """
    Get a database connection by name, or the default database connection
    if no name is provided. This is a private API.
    """
    if using is None:
        using = DEFAULT_DB_ALIAS
    return connections[using].session


def begin(using=None):
    conn = get_connection(using)
    if conn.transaction is None:
        conn.begin()
    return conn.transaction


class Atomic(ContextDecorator):
    def __init__(self, using, savepoint):
        self.using = using
        self.savepoint = savepoint
        self.trans = None

    def __enter__(self):
        self.trans = begin(self.using)

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.trans.commit()


@contextmanager
def _atomic(using, savepoint):
    trans = begin(using)
    yield trans
    trans.commit()


def atomic(fn, using=DEFAULT_DB_ALIAS, savepoint=False):
    if callable(fn):
        @wraps(fn)
        def inner(*args, **kwargs):
            with _atomic(using, savepoint):
                return fn(*args, **kwargs)
        return inner
