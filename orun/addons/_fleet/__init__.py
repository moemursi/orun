import orun
from orun.utils.translation import gettext_lazy as _


class AppConfig(orun.AppConfig):
    name = _('Fleet')
    version = '0.1'
    auto_install = False
    installable = True
    fixtures = ['actions.xml', 'fleet.vehicle.make.txt', 'fleet.vehicle.model.txt', 'reports.xml', 'menu.xml']
    #demo = ['demo.json']
    depends = ['base', 'mail']
    db_schema = 'fleet'


addon = AppConfig()
