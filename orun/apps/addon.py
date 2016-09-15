import os
from importlib import import_module
import flask

from .registry import registry


class AppConfig(flask.Blueprint):
    name = None
    description = None
    short_description = None
    dependencies = ['base']
    version = None
    fixtures = []
    demo = []
    author = None
    auto_install = False
    installable = True
    schema = None
    db_schema = None
    models_module = None
    models = {}

    def __init__(self, schema=None, app_module=None, *args, **kwargs):
        kwargs.setdefault('template_folder', 'templates')
        self.is_ready = False
        self.module = app_module
        mod_name = app_module or self.__class__.__module__.split('.')[-1]
        if not args:
            args = [self.name, mod_name]

        super(AppConfig, self).__init__(*args, **kwargs)

        if self.schema is None:
            self.schema = schema or mod_name

        if self.import_name == 'base':
            self.dependencies = []
        registry.addons[mod_name] = self

    @property
    def app_label(self):
        return self.schema

    def init_addon(self):
        with registry._lock:
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
                    pass

                # Register addon commands
                for mod_name in registry.find_commands(os.path.join(self.path, 'management')):
                    try:
                        mod = import_module('%s.management.commands.%s' % (self.schema, mod_name))
                        registry.module_commands[self.schema] = mod.cli
                    except ImportError:
                        pass
                self.ready()

    def ready(self):
        pass

    def get_models(self, include_auto_created=False, include_deferred=False, include_swapped=False):
        """
        Returns an iterable of models.

        By default, the following models aren't included:

        - auto-created models for many-to-many relations without
          an explicit intermediate table,
        - models created to satisfy deferred attribute queries,
        - models that have been swapped out.

        Set the corresponding keyword argument to True to include such models.
        Keyword arguments aren't documented; they're a private API.
        """
        for model in self.models.values():
            #if model._deferred and not include_deferred:
            #    continue
            if model._meta.auto_created and not include_auto_created:
                continue
            if model._meta.swapped and not include_swapped:
                continue
            yield model

