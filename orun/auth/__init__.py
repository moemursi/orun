from orun import app, session
from orun.utils.crypto import constant_time_compare
from .anonymous import AnonymousUser


SESSION_KEY = '_auth_user_id'
HASH_SESSION_KEY = '_auth_user_hash'
REDIRECT_FIELD_NAME = 'next'


def get_user_model():
    return app['auth.user']


def _get_user_session_key():
    # This value in the session is always serialized to a string, so we need
    # to convert it back to Python whenever we access it.
    return get_user_model()._meta.pk.to_python(session[SESSION_KEY])


def get_user():
    model = get_user_model()
    user = None
    try:
        user_id = _get_user_session_key()
    except KeyError:
        pass
    else:
        user = model.objects.get(user_id)
    return user or AnonymousUser()
