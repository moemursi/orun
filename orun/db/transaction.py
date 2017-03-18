from orun.db import (
    DEFAULT_DB_ALIAS, DatabaseError, Error, ProgrammingError, connections,
)
from functools import wraps


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
    conn = get_connection(using).session
    return conn.begin()


class Atomic(object):
    def __init__(self, using, savepoint):
        self.using = using
        self.savepoint = savepoint

    def __call__(self, func):
        @wraps(func)
        def inner(*args, **kwds):
            with _atomic(self.using, self.savepoint):
                return func(*args, **kwds)
        return inner


def _atomic(using, savepoint):
    conn = get_connection(using)
    if savepoint:
        return conn.begin_nested()
    return conn.begin(subtransactions=conn.is_active)


def atomic(using=None, savepoint=False):
    if callable(using):
        return Atomic(DEFAULT_DB_ALIAS, savepoint)(using)
    else:
        return _atomic(using, savepoint)
