import orun
from orun.utils.translation import gettext_lazy as _


class AppConfig(orun.AppConfig):
    name = 'Blog'
    version = '0.1'
    auto_install = False
    installable = True
    fixtures = []
    #demo = ['demo.json']
    depends = ['base']


addon = AppConfig()
