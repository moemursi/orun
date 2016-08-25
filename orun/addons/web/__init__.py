import orun


class Blueprint(orun.AppConfig):
    name = 'Web'
    version = '0.1'
    auto_install = True

addon = Blueprint()
