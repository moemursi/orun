import orun
from orun.utils.translation import gettext_lazy as _


class AppConfig(orun.AppConfig):
    name = _('Human Resources')
    category = _('Human Resources')
    version = '0.1'
    auto_install = False
    installable = True
    depends = ['base']
    db_schema = 'hr'


addon = AppConfig()
