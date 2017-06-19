import os
from importlib import import_module
import flask

from .registry import apps


class AppConfig(flask.Blueprint):
    name = None
    description = None
    short_description = None
    depends = ['base']
    version = None
    fixtures = []
    demo = []
    author = None
    auto_install = False
    installable = True
    schema = None
    db_schema = None
    create_schema = None
    models_module = None

    def __init__(self, schema=None, app_module=None, *args, **kwargs):
        self.models = {}
        kwargs.setdefault('template_folder', 'templates')
        kwargs.setdefault('static_folder', 'static')
        mod_name = app_module or self.__class__.__module__.split('.')[-1]
        if self.schema is None:
            self.schema = schema or mod_name
        kwargs.setdefault('url_prefix', '/static/%s' % self.schema)
        self.name = self.schema
        self.is_ready = False
        self.module = app_module
        if not args:
            args = [self.name, mod_name]
        registry = kwargs.pop('registry', apps)

        super(AppConfig, self).__init__(*args, **kwargs)

        if self.import_name == 'base':
            self.dependencies = []
        if registry:
            registry.app_configs[self.schema] = self

    @property
    def app_label(self):
        return self.schema

    @property
    def label(self):
        return self.schema

    def init_addon(self):
        with apps._lock:
            if not self.is_ready:
                self.is_ready = True

                # Load models
                try:
                    self.models_module = import_module('%s.models' % self.schema)
                except ImportError:
                    pass

                # Register views
                try:
                    import_module('%s.views' % self.schema)
                except ImportError:
                    if self.schema == 'web':
                        raise

                # Register addon commands
                for mod_name in apps.find_commands(os.path.join(self.path, 'management')):
                    try:
                        mod = import_module('%s.management.commands.%s' % (self.schema, mod_name))
                        apps.module_commands[self.schema].append(mod.command)
                    except ImportError:
                        pass
                self.ready()

    def ready(self):
        pass

    def get_models(self):
        return self.models.values()
