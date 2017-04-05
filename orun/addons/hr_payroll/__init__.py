import orun
from orun.utils.translation import gettext_lazy as _


class AppConfig(orun.AppConfig):
    name = _('Payroll')
    category = _('Human Resources')
    version = '0.1'
    auto_install = False
    installable = True
    #fixtures = ['actions.xml', 'menu.xml']
    depends = ['hr_contract']
    db_schema = 'hr'


addon = AppConfig()
