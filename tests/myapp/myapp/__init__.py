import orun


class AppConfig(orun.AppConfig):
    name = 'MyApp'
    version = '0.1'
    auto_install = False
    installable = True
    # fixtures = [
    #     'actions.xml', 'menu.xml',
    # ]
    depends = ['mail']


addon = AppConfig()
