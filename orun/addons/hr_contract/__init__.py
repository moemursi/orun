import orun
from orun.utils.translation import gettext_lazy as _


class AppConfig(orun.AppConfig):
    name = _('Employee Contracts')
    category = _('Human Resources')
    version = '0.1'
    auto_install = False
    installable = True
    depends = ['hr']
    db_schema = 'hr'


addon = AppConfig()
