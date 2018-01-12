from orun import request, g, session

from orun.utils.functional import SimpleLazyObject
from orun import auth


def auth_before_request():
    g.user_id = session[auth.AUTH_SESSION_KEY]
    g.user = SimpleLazyObject(lambda: auth.get_user(auth.AUTH_SESSION_KEY))
    g.site_user_id = session.get(auth.SITE_SESSION_KEY)
    g.site_user = SimpleLazyObject(lambda: auth.get_user(auth.SITE_SESSION_KEY, 'res.partner'))
