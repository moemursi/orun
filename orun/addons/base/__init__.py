import orun
from orun.db.models.signals import post_migrate


class AppConfig(orun.AppConfig):
    name = 'Base'
    version = '0.1'
    auto_install = True
    default_language = 'en-us'
    fixtures = ['modules.xml', 'views.xml', 'actions.xml', 'menu.xml', 'currency.xml', 'country.xml', 'partner.xml']
    depends = []


addon = AppConfig()
