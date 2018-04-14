import os
import sys
from collections import defaultdict, OrderedDict
from threading import Lock
import pkgutil
from importlib import import_module
from functools import partial

import orun
from orun.core.exceptions import AppRegistryNotReady
from orun.conf import ADDONS_ENVIRONMENT_VARIABLE


class Registry(object):

    def __init__(self, app_configs=None):
        self.ready = False
        self.apps_loaded = False
        self.models_ready = False
        self.app_configs = app_configs or {}
        self.modules = {}
        self.basic_commands = []
        self.module_models = defaultdict(OrderedDict)
        self.module_commands = defaultdict(list)
        self.module_views = defaultdict(list)
        self._lock = Lock()
        self.all_models = OrderedDict()
        self._pending_operations = defaultdict(list)
        base_dir = os.path.join(os.path.dirname(__file__))
        self.addon_path = [os.path.join(base_dir, '..', 'addons'), os.path.join(base_dir, '..', '..', 'addons')]  # basic addons paths

        if ADDONS_ENVIRONMENT_VARIABLE in os.environ:
            self.addon_path.extend(os.environ[ADDONS_ENVIRONMENT_VARIABLE].split(';'))

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
                pass
        for cmd in self.module_commands['orun']:
            self.basic_commands.append(cmd)

    def find_addons(self):
        self.apps_loaded = True
        paths = self.addon_path
        with self._lock:
            for path in paths:
                sys.path.append(path)
                for _, name, is_pkg in pkgutil.iter_modules([path]):
                    if is_pkg and not name.startswith('_'):
                        try:
                            mod = import_module(name)
                            app_config = mod.addon
                            app_config.path = os.path.dirname(mod.__file__)
                            self.modules[name] = mod
                            self.app_configs[name] = app_config
                            print(name)
                        except (ImportError, AttributeError) as e:
                            print(e)
                            pass

    def check_models_ready(self):
        """
        Raises an exception if all models haven't been imported yet.
        """
        if not self.models_ready:
            raise AppRegistryNotReady("Models aren't loaded yet.")

    def register_model(self, mod_name, model):
        self.all_models[model._meta.name] = model
        self.module_models[mod_name][model._meta.model_name] = model
        if mod_name in self.app_configs:
            self.app_configs[mod_name].models[model._meta.name] = model
        #self.do_pending_operations(model)

    # Migration related methods

    def get_app_configs(self):
        return self.app_configs.values()

    def get_app_config(self, app_label):
        return self.app_configs[app_label]

    def get_models(self):
        for module in self.module_models:
            for model in self.module_models[module].values():
                yield model

    def get_model(self, app_label, model_name=None):
        if model_name is None:
            app_label, model_name = app_label.split('.')
        return self.module_models[app_label][model_name]

# Start main registry
apps = registry = Registry()
