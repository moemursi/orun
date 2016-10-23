import os
import sys
from threading import Lock
import pkgutil
from collections import defaultdict, OrderedDict
from importlib import import_module
from functools import partial, lru_cache
import flask
import flask.app

import orun
from orun.core.exceptions import AppRegistryNotReady
from orun.conf import ADDONS_ENVIRONMENT_VARIABLE


class Registry(object):

    def __init__(self, configs=None):
        self.ready = False
        self.addons_loaded = False
        self.addons = {}
        self.modules = {}
        self.module_models = defaultdict(OrderedDict)
        self.module_commands = defaultdict(list)
        self.module_views = defaultdict(list)
        self.basic_commands = []
        self.all_models = {}
        self._pending_operations = defaultdict(list)
        self.models_ready = False
        self._lock = Lock()
        self._configs = configs
        base_dir = os.path.join(os.path.dirname(__file__))
        self.addon_path = [os.path.join(base_dir, '..', 'addons'), os.path.join(base_dir, '..', '..', 'addons')]  # basic addons paths
        if ADDONS_ENVIRONMENT_VARIABLE in os.environ:
            print('ADDONS PATH', os.environ[ADDONS_ENVIRONMENT_VARIABLE].split(';'))
            self.addon_path.extend(os.environ[ADDONS_ENVIRONMENT_VARIABLE].split(';'))

    def get_model(self, app_label, model_name=None):
        if '.' in model_name:
            return self.all_models[model_name]
        return self.module_models[app_label][model_name]

    def find_commands(self, management_dir):
        """
        Given a path to a management directory, returns a list of all the command
        names that are available.

        Returns an empty list if no commands are defined.
        """
        command_dir = os.path.join(management_dir, 'commands')
        return [name for _, name, is_pkg in pkgutil.iter_modules([command_dir])
                if not is_pkg and not name.startswith('_')]

    def setup(self):
        self.ready = True
        self.find_addons()
        self.models_ready = True

        # Find basic commands
        for mod_name in self.find_commands(os.path.join(os.path.dirname(orun.__file__), 'core', 'management')):
            try:
                mod = import_module('orun.core.management.commands.%s' % mod_name)
                self.module_commands['orun'].append(mod.command)
            except ImportError:
                raise
        for cmd in self.module_commands['orun']:
            self.basic_commands.append(cmd)

    def clear_cache(self):
        """
        Clears all internal caches, for methods that alter the app registry.

        This is mostly used in tests.
        """
        # Call expire cache on each model. This will purge
        # the relation tree and the fields cache.
        self.get_models.cache_clear()
        if self.ready:
            # Circumvent self.get_models() to prevent that the cache is refilled.
            # This particularly prevents that an empty value is cached while cloning.
            for app_config in self.addons.values():
                for model in app_config.get_models(include_auto_created=True):
                    model._meta._expire_cache()

    def set_available_apps(self, apps):
        pass

    def unset_available_apps(self):
        pass

    @lru_cache(maxsize=None)
    def get_models(self, include_auto_created=False, include_deferred=False, include_swapped=False):
        """
        Returns a list of all installed models.

        By default, the following models aren't included:

        - auto-created models for many-to-many relations without
          an explicit intermediate table,
        - models created to satisfy deferred attribute queries,
        - models that have been swapped out.

        Set the corresponding keyword argument to True to include such models.
        """
        result = []
        for addon in self.addons.values():
            result.extend(list(addon.get_models(include_auto_created, include_deferred, include_swapped)))
        return result

    def populate(self, addons):
            with self._lock:
                for entry in addons:
                    self.addons[entry.schema] = entry

    def find_addons(self):
        self.addons_loaded = True
        paths = self.addon_path
        with self._lock:
            for path in paths:
                sys.path.append(path)
                for _, name, is_pkg in pkgutil.iter_modules([path]):
                    if is_pkg and not name.startswith('_'):
                        try:
                            mod = import_module(name)
                            addon = mod.addon
                            addon.path = os.path.dirname(mod.__file__)
                            self.modules[name] = mod
                            self.addons[name] = addon
                        except ImportError:
                            raise
                        except AttributeError:
                            pass

    def get_addon(self, name):
        return self.addons[name]

    def register_model(self, mod_name, model):
        self.all_models[model._meta.name] = model
        self.module_models[mod_name][model.__name__.lower()] = model
        if mod_name in self.addons:
            self.addons[mod_name].models = self.module_models[mod_name]
        self.do_pending_operations(model)

    def __delitem__(self, key):
        model = self.all_models[key]
        idx = self.module_models[model._meta.app_label].index(model)
        del self.module_models[model._meta.app_label][idx]
        del self.all_models[key]

    def get_registered_model(self, model_name):
        """
        Similar to get_model(), but doesn't require that an app exists with
        the given app_label.

        It's safe to call this method at import time, even while the registry
        is being populated.
        """
        if isinstance(model_name, tuple):
            return self.module_models[model_name[0]][model_name[1]]
        if isinstance(model_name, str):
            return self.all_models[model_name]
        else:
            model = model_name
        if model is None:
            raise LookupError(
                "Model '%s' not registered." % model_name)
        return model

    def get_addons(self):
        return flask.current_app.installed_modules

    def lazy_model_operation(self, function, *model_keys):
        """
        Take a function and a number of ("app_label", "modelname") tuples, and
        when all the corresponding models have been imported and registered,
        call the function with the model classes as its arguments.

        The function passed to this method must accept exactly n models as
        arguments, where n=len(model_keys).
        """
        # If this function depends on more than one model, we recursively turn
        # it into a chain of functions that accept a single model argument and
        # pass each in turn to lazy_model_operation.
        model_key, more_models = model_keys[0], model_keys[1:]
        if more_models:
            supplied_fn = function

            def function(model):
                next_function = partial(supplied_fn, model)
                # Annotate the function with its field for retrieval in
                # migrations.state.StateApps.
                if getattr(supplied_fn, 'keywords', None):
                    next_function.field = supplied_fn.keywords.get('field')
                self.lazy_model_operation(next_function, *more_models)

        # If the model is already loaded, pass it to the function immediately.
        # Otherwise, delay execution until the class is prepared.
        try:
            model_class = self.get_registered_model(model_key)
        except LookupError:
            self._pending_operations[model_key].append(function)
        else:
            function(model_class)

    def check_models_ready(self):
        """
        Raises an exception if all models haven't been imported yet.
        """
        if not self.models_ready:
            raise AppRegistryNotReady("Models aren't loaded yet.")

    def do_pending_operations(self, model):
        """
        Take a newly-prepared model and pass it to each function waiting for
        it. This is called at the very end of `Apps.register_model()`.
        """
        #key = model._meta.app_label, model._meta.model_name
        from orun.db.models.utils import make_model_tuple
        key = make_model_tuple(model)
        for function in self._pending_operations.pop(key, []):
            function(model)


# Start main registry
apps = registry = Registry()
