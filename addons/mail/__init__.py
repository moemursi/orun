import orun


class AppConfig(orun.AppConfig):
    dependencies = ['base']
    name = 'Mail'
    version = '0.1'
    db_schema = 'mail'

addon = AppConfig()
