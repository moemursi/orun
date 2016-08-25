import orun


class AppConfig(orun.AppConfig):
    dependencies = ['base', 'mail']
    name = 'Product'
    version = '0.1'
    db_schema = 'product'

addon = AppConfig()
