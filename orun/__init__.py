from flask import (current_app as app, g as env, request, session, render_template, render_template_string)
from orun.utils.version import get_version
from orun.apps import Application, AppConfig

VERSION = (0, 0, 1, 'alpha', 0)
__version__ = get_version(VERSION)
