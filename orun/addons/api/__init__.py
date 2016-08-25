import orun


class AppConfig(orun.AppConfig):
    name = 'REST API'
    version = '0.1'
    auto_install = True

addon = AppConfig()
