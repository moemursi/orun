import orun


class AppConfig(orun.AppConfig):
    dependencies = ['base']
    name = 'Resources'
    version = '0.1'
    db_schema = 'resource'

addon = AppConfig()
