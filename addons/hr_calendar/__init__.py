import orun


class AppConfig(orun.AppConfig):
    dependencies = ['base', 'hr']
    name = 'Human Resources Calendar'
    category = 'Human Resources'
    summary = 'Calendar, Holidays, Allocation and Leave Requests'
    version = '0.1'
    db_schema = 'hr'

addon = AppConfig()
