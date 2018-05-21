from functools import wraps, partial
from urllib.parse import urlparse, urlunparse
from datetime import timedelta
from flask import request, redirect, make_response, session, url_for

from orun import app
from orun.utils.decorators import available_attrs
from orun.conf import settings
from orun.auth import REDIRECT_FIELD_NAME
from orun.auth import AUTH_SESSION_KEY, SITE_SESSION_KEY


def _login_required(fn=None, redirect_field_name=REDIRECT_FIELD_NAME, login_url=None, session_key=AUTH_SESSION_KEY):
    if callable(login_url):
        login_url = login_url()

    def decorator(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            user = session.get(session_key)
            # Disable decorator for testing framework
            if user or app.config['TESTING']:
                return view_func(*args, **kwargs)
            for k, v in request.environ.items():
                print(k, v)
            print(request.environ['Scheme'])
            return redirect(
                url_for(
                    login_url, _external=True, _scheme=request.environ['wsgi.url_scheme'],
                    **{redirect_field_name: request.path})
                if ':' in login_url else login_url
            )
        return wrapped

    if fn:
        return decorator(fn)
    return decorator


# API Login Required Decorator
login_required = partial(_login_required, login_url='WebClient:login')
# Basic Site Login Required Decorator
site_login_required = partial(
    _login_required, session_key=SITE_SESSION_KEY, login_url=lambda: app.config.get('SITE_LOGIN_URL')
)


def cross_domain(origin=None, methods=None, headers=None, max_age=21600, attach_to_all=True, automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, str):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, str):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        @wraps(f)
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return wrapped_function

    return decorator
