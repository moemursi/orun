from functools import wraps
from urllib.parse import urlparse, urlunparse
from flask import request, redirect

from orun import env
from orun.http import QueryDict
from orun.utils.decorators import available_attrs
from orun.conf import settings
from orun.auth import REDIRECT_FIELD_NAME


def login_required(fn=None, redirect_field_name=REDIRECT_FIELD_NAME, login_url=None):

    def decorator(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            if env.user.is_authenticated():
                return view_func(*args, **kwargs)
            return redirect('/web/login/')
        return wrapped

    if fn:
        return decorator(fn)
    return decorator
