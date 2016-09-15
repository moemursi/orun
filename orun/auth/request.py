from orun import request, env

from orun.utils.functional import SimpleLazyObject
from orun import auth


def get_user():
    if not hasattr(env, '_cached_user'):
        request._cached_user = auth.get_user()
    return request._cached_user


def auth_before_request():
    env.user = SimpleLazyObject(lambda: get_user())
