from functools import wraps
from flask_classy import FlaskView, route

from orun.apps import apps


REDIRECT_FIELD_NAME = None


class ViewType(type):
    def __init__(cls, name, bases, attrs):
        super(ViewType, cls).__init__(name, bases, attrs)

        # Register as module view
        mod_name = cls.__module__.split('.')[0]
        if mod_name != 'orun':
            apps.module_views[mod_name].append(cls)


class BaseView(FlaskView, metaclass=ViewType):
    pass
