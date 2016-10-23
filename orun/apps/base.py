import os
import sys
from threading import Lock
import pkgutil
from collections import defaultdict, OrderedDict
from importlib import import_module
from functools import partial, lru_cache
import logging
import logging.config
import flask
import flask.app
from flask import Flask

from orun.core.exceptions import AppRegistryNotReady
from orun.utils.translation import activate
from orun.utils.log import DEFAULT_LOGGING
from orun.utils.functional import cached_property
from .registry import registry
from .utils import adjust_dependencies


class Application(Flask):
    def __init__(self, *args, **kwargs):
        import orun.auth.request
        settings = kwargs.pop('settings', {})
        super(Application, self).__init__(*args, **kwargs)
        self.module_name = self.__class__.__module__.split('.')[-1]
        self.models = {}
        settings.setdefault('INSTALLED_APPS', [])
        settings.setdefault('DEFAULT_INDEX_TABLESPACE', None)
        settings.setdefault('DEBUG', True)
        settings.setdefault('LOCALE_PATHS', [])
        settings.setdefault('LANGUAGE_CODE', 'pt-br')
        settings.setdefault('USE_I18N', True)
        settings.setdefault('USE_L10N', True)
        settings.setdefault('USE_TZ', False)
        settings.setdefault('DATABASE_ROUTERS', [])
        settings.setdefault('MIGRATION_MODULES', {})
        settings.setdefault('MEDIA_ROOT', None)
        settings.setdefault('STATIC_ROOT', None)
        settings.setdefault('MAX_NAME_LENGTH', 30)
        settings.setdefault('TIME_ZONE', None)
        settings.setdefault('SERIALIZATION_MODULES', {})
        settings.setdefault('DEFAULT_CHARSET', 'utf-8')

        settings.setdefault('FORMAT_MODULE_PATH', None)
        settings.setdefault('TIME_INPUT_FORMATS', [
            '%H:%M:%S',     # '14:30:59'
            '%H:%M:%S.%f',  # '14:30:59.000200'
            '%H:%M',        # '14:30'
        ])

        settings.setdefault('SUPERUSER_ID', 1)
        settings.setdefault('SUPERUSER', 'admin')
        settings.setdefault('PASSWORD', 'admin')

        self.before_request(orun.auth.request.auth_before_request)
        log = {}
        l = logging.getLogger('orun.db.backends')
        l.setLevel(logging.DEBUG)
        l.addHandler(logging.StreamHandler())
        log.update(DEFAULT_LOGGING)
        log.update({
            'loggers': {
                'orun.db.backends.postgresql': {
                    'level': 'INFO',
                    'handlers': ['console'],
                }
            }
        })
        #logging.config.dictConfig(log)
        # settings.setdefault('DATABASES', {
        #     'default': {
        #         'ENGINE': 'orun.db.backends.mssql',
        #         'HOST': '.',
        #         'USER': 'sa',
        #         'PASSWORD': '1',
        #         'NAME': 'test2',
        #         'OPTIONS': {
        #             'driver': 'SQL Server'
        #         }
        #     }
        # })
        LOCAL = os.path.isfile('.local')

        if LOCAL:
            settings.setdefault('DATABASES', {
                'default': {
                    'ENGINE': 'orun.db.backends.postgresql',
                    'HOST': 'localhost',
                    'USER': 'postgres',
                    'PASSWORD': '1',
                    'NAME': 'test2',
                }
            })
        else:
            settings.setdefault('DATABASES', {
                'default': {
                    'ENGINE': 'orun.db.backends.postgresql',
                    'USER': 'postgres',
                    'HOST': '',
                    'PORT': '5433',
                    'PASSWORD': '1',
                    'NAME': 'mobmundi',
                }
            })
        self.config.update(settings)

        # Load connections
        from orun.db import ConnectionHandler
        self.connections = ConnectionHandler()

        # Find addons
        if not registry.ready:
            registry.setup()

        # Register basic commands
        for cmd in registry.basic_commands:
            self.cli.add_command(cmd)

        # Load addons
        mods = ['web', 'product', 'sopando', 'mobmundi']
        mods = adjust_dependencies(mods)
        self.installed_modules = []
        with self.app_context():
            for mod_name in mods:
                addon = registry.addons[mod_name]
                addon.init_addon()
                self.installed_modules.append(addon)

                # Build models
                for model_class in registry.module_models[addon.schema].values():
                    model_class._build_model(self)

                # Register blueprints
                self.register_blueprint(addon)

                # Register addon commands
                for cmd in registry.module_commands[addon.app_label]:
                    self.cli.add_command(cmd)

                # Register addon views on app
                self._register_views(addon)

    def __getitem__(self, item):
        return self.models[item]

    def __setitem__(self, key, value):
        self.models[key] = value

    def _create_db(self):
        pass

    def _register_views(self, addon):
        for view in registry.module_views[addon.schema]:
            view.register(self)

    def get_model(self, model_name):
        if isinstance(model_name, type):
            model_name = model_name._meta.name
        return self[model_name]

    def app_context(self, **kwargs):
        old_state = {}
        ctx = AppContext(self)
        try:
            old_state.update(flask.g.__dict__)
            ctx._old_lang = old_state['LANGUAGE_CODE']
        except:
            pass
        ctx.g.user_id = 1  # Replace by the current user
        for k, v in kwargs.items():
            setattr(ctx.g, k, v)
        ctx.g.LANGUAGE_CODE = kwargs.pop('LANGUAGE_CODE', old_state.get('LANGUAGE_CODE', self.config['LANGUAGE_CODE']))
        return ctx


class AppContext(flask.app.AppContext):
    _old_lang = None

    def __enter__(self):
        super(AppContext, self).__enter__()
        # Apply new context language state
        if self.g.LANGUAGE_CODE:
            activate(self.g.LANGUAGE_CODE)

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Restore the old context language state
        if self._old_lang:
            activate(self._old_lang)
        super(AppContext, self).__exit__(exc_type, exc_val, exc_tb)
