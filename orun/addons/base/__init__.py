import orun
from orun.db.models.signals import post_migrate
from .registry import register_models


class AppConfig(orun.AppConfig):
    name = 'Base'
    version = '0.1'
    auto_install = True
    default_language = 'en-us'
    fixtures = ['modules.xml', 'actions.xml', 'menu.xml', 'partner.xml']

    def ready(self):
        post_migrate.connect(register_models)


addon = AppConfig()
