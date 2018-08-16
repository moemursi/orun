import inspect
from contextlib import contextmanager

import flask
import sqlalchemy as sa
from flask import Flask
from flask_mail import Mail
from jinja2 import Undefined
from sqlalchemy.engine.url import make_url
from sqlalchemy.schema import CreateSchema

from orun import g, SUPERUSER
from orun.auth.request import auth_before_request
from orun.conf import global_settings
from orun.db import (connection, DEFAULT_DB_ALIAS)
from orun.utils import translation
from orun.utils.functional import SimpleLazyObject
from .registry import registry
from .utils import adjust_dependencies


class SilentUndefined(Undefined):
    def _fail_with_undefined_error(self, *args, **kwargs):
        return ''


class Application(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options['undefined'] = SilentUndefined
    jinja_options['extensions'] = ['jinja2.ext.autoescape', 'jinja2.ext.with_', 'jinja2.ext.i18n']

    def __init__(self, *args, **kwargs):
        settings = {}
        settings.update(global_settings.settings)
        self.base_settings = kwargs.pop('settings', {})
        settings.update(self.base_settings)

        super(Application, self).__init__(*args, **kwargs)
        self.models = {}

        # Site user definition request handler
        self.before_request(auth_before_request)

        # Load connections
        from orun.db import ConnectionHandler
        self.connections = ConnectionHandler()

        self.config.update(settings)

        # Start mail server
        if 'MAIL_SERVER' in self.config:
            mail = Mail()
            mail.init_app(self)
            self.mail = mail

        # Init sqlalchemy metadata
        self.meta = sa.MetaData()

        # Find addons
        if not registry.ready:
            registry.setup()

        # Register basic commands
        for cmd in registry.basic_commands:
            self.cli.add_command(cmd)

        # Load addons
        mods = settings.get('ADDONS', [])
        if 'web' not in mods:
            mods.insert(1, 'web')
        mods = adjust_dependencies(mods)
        self.app_configs = {}
        self.addons = []

        with self.app_context():
            for mod_name in mods:
                addon = registry.app_configs[mod_name]
                addon.init_addon()
                self.app_configs[mod_name] = addon
                self.addons.append(addon)

                # Build models
                for model_class in registry.module_models[addon.name].values():
                    if not model_class._meta.abstract and not getattr(model_class._meta, 'auto_created', None):
                        model_class._meta._build_model(self)

                # Register blueprints
                self.register_blueprint(addon)

                # Register addon commands
                for cmd in registry.module_commands[addon.app_label]:
                    self.cli.add_command(cmd)

                # Register addon views on app
                self._register_views(addon)

            # Initialize app context models
            self.build_models()

            for addon in self.addons:
                # Initialize addon on current instance
                if hasattr(addon, 'init_app'):
                    addon.init_app(self)

    def build_models(self):
        print('Building models')
        for model in self.models.values():
            model._meta._build_table(self.meta)

        try:
            for model in list(self.models.values()):
                model._meta._build_mapper()
        except:
            print('Error building model', model._meta.name)
            raise

    def create_all(self):
        self._create_schemas()
        self.meta.create_all(self.db_engine)
        self._register_models()

    def _create_schemas(self):
        engine = self.db_engine
        for app_config in self.addons:
            if app_config.db_schema:
                engine.execute(CreateSchema(app_config.db_schema))

    def load_fixtures(self):
        from orun.core.management.commands import loaddata
        for addon in self.addons:
            for fixture in addon.fixtures:
                loaddata.load_fixture(addon, fixture)

    def register_db(self, database):
        if database not in self.config['DATABASES']:
            def_db = self.config['DATABASES'][DEFAULT_DB_ALIAS]
            url = make_url(def_db['ENGINE'])
            url.database = database
            self.config['DATABASES'][database] = {
                'ENGINE': str(url)
            }

    def _register_models(self):
        from base.registry import register_model
        for model in self.models.values():
            register_model(model)

    def get_model(self, item):
        if inspect.isclass(item):
            item = item._meta.name
        return self.models[item]

    def __getitem__(self, item):
        return g.env[item]

    def __setitem__(self, key, value):
        self.models[key] = value

    def __contains__(self, item):
        if inspect.isclass(item):
            item = item._meta.name
        return item in self.models

    @property
    def db_engine(self):
        """
        Get the default database engine
        """
        return self.connections[DEFAULT_DB_ALIAS].engine

    @property
    def db_session(self):
        """
        Get the default database session
        """
        return connection.session

    def _register_views(self, addon):
        for view in registry.module_views[addon.schema]:
            view.register(self)

    def app_context(self, user_id=SUPERUSER, **kwargs):
        old_state = {}
        ctx = AppContext(self)
        try:
            old_state.update(flask.g.__dict__)
            ctx._old_lang = old_state['LANGUAGE_CODE']
        except:
            pass
        database = kwargs.pop('db', None)
        if database:
            self.register_db(database)
        ctx.g.DEFAULT_DB_ALIAS = database or self.config.get('DEFAULT_DB_ALIAS', DEFAULT_DB_ALIAS)
        for k, v in kwargs.items():
            setattr(ctx.g, k, v)
        ctx.g.LANGUAGE_CODE = kwargs.pop('LANGUAGE_CODE', old_state.get('LANGUAGE_CODE', self.config['LANGUAGE_CODE']))
        ctx.g.user_id = user_id
        ctx.g.user = SimpleLazyObject(lambda: self['auth.user'].objects.get(user_id))
        context = {
            'lang': ctx.g.LANGUAGE_CODE,
            'user_id': user_id,
        }
        ctx.g.env = Environment(user_id, context)
        ctx.g.context = context
        return ctx

    def create_jinja_environment(self):
        rv = super(Application, self).create_jinja_environment()
        rv.install_gettext_callables(translation.gettext, translation.ngettext)
        return rv

    def iter_blueprints(self):
        return reversed(self._blueprint_order)

    def sudo(self, user_id=SUPERUSER):
        return self.with_context(user_id)

    @contextmanager
    def with_context(self, user_id=None, context=None):
        if user_id is None:
            user_id = SUPERUSER
        old_env = g.env
        new_env = g.env(user_id, context)
        g.env = new_env
        yield
        g.env = old_env

    def static_reverse(self, url):
        _, _, addon, url = url.split('/', 3)
        fn = self.view_functions[f'{addon}.static']
        return fn(url).response.file.name


class AppContext(flask.app.AppContext):
    _old_lang = None

    def __enter__(self):
        super(AppContext, self).__enter__()
        # Apply new context language state
        if self.g.LANGUAGE_CODE:
            translation.activate(self.g.LANGUAGE_CODE)

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Restore the old context language state
        if self._old_lang:
            translation.activate(self._old_lang)
        super(AppContext, self).__exit__(exc_type, exc_val, exc_tb)


from orun.api import Environment
