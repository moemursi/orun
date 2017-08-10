import copy
from threading import Lock
from orun.apps import Application


class BaseDispatcher(object):
    application_class = Application

    def __init__(self, settings=None):
        self.instances = {}
        self.lock = Lock()
        self.base_settings = settings

    def create_app(self, instance_name):
        settings = self.create_settings(instance_name)
        return Application(instance_name, settings=settings)

    def create_settings(self, instance_name):
        return copy.deepcopy(self.base_settings)

    def get(self, instance_name):
        with self.lock:
            if instance_name not in self.instances:
                self.instances[instance_name] = self.create_app(instance_name)
            return self.instances[instance_name]


class SubdomainDispatcher(BaseDispatcher):
    def __init__(self, settings=None, subdomains=None):
        super(SubdomainDispatcher, self).__init__(settings=settings)
        self.subdomains = subdomains
