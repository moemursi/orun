from functools import wraps

from orun.core.exceptions import ObjectDoesNotExist  # NOQA
from orun.db.models import signals  # NOQA
from orun.db.models.aggregates import *  # NOQA
from orun.db.models.deletion import (  # NOQA
    CASCADE, DO_NOTHING, PROTECT, SET, SET_DEFAULT, SET_NULL, ProtectedError,
)
from orun.db.models.expressions import (  # NOQA
    Case, Expression, ExpressionWrapper, F, Func, Value, When,
)
from orun.db.models.fields import *  # NOQA
#from orun.db.models.fields.files import FileField, ImageField  # NOQA
from orun.db.models.fields.proxy import OrderWrt  # NOQA
from orun.db.models.indexes import *  # NOQA
from orun.db.models.lookups import Lookup, Transform  # NOQA
from orun.db.models.manager import Manager  # NOQA
from orun.db.models.query import (  # NOQA
    Prefetch, Q, QuerySet, prefetch_related_objects,
)

# Imports that would create circular imports if sorted
from orun.db.models.base import DEFERRED, Model  # NOQA isort:skip
from orun.db.models.fields.related import (  # NOQA isort:skip
    ForeignKey, ForeignObject, OneToOneField, ManyToManyField,
    ManyToOneRel, ManyToManyRel, OneToOneRel,
)


def permalink(func):
    """
    Decorator that calls urls.reverse() to return a URL using parameters
    returned by the decorated function "func".

    "func" should be a function that returns a tuple in one of the
    following formats:
        (viewname, viewargs)
        (viewname, viewargs, viewkwargs)
    """
    from orun.urls import reverse

    @wraps(func)
    def inner(*args, **kwargs):
        bits = func(*args, **kwargs)
        return reverse(bits[0], None, *bits[1:3])
    return inner
