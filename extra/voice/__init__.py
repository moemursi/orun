import orun


class AppConfig(orun.AppConfig):
    name = 'Voice Command'
    version = '0.1'
    auto_install = False

addon = AppConfig()
