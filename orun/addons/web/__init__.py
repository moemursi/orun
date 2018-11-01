import orun


class AppConfig(orun.AppConfig):
    name = 'Web'
    version = '0.1'
    auto_install = True
    js_templates = [
        'static/api/1.7/templates.html',
    ]

addon = AppConfig()
