import orun


class AppConfig(orun.AppConfig):
    name = 'Web'
    version = '0.1'
    auto_install = True

addon = AppConfig()
