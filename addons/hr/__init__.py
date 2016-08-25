import orun


class AppConfig(orun.AppConfig):
    dependencies = ['base']
    name = 'Human Resources'
    version = '0.1'
    db_schema = 'hr'

addon = AppConfig()
