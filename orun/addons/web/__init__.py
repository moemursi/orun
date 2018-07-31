import orun


class AppConfig(orun.AppConfig):
    name = 'Web'
    version = '0.1'
    auto_install = True
    js_templates = [
        'static/api/templates/view.xml',
        'static/api/templates/form.xml',
        'static/api/templates/list.xml',
        'static/api/templates/card.xml',
        'static/api/templates/search.xml',
        'static/api/templates/dialog.xml',
        'static/api/templates/report.xml',
        'static/api/templates/dashboard.xml',
        'static/api/templates/fields.xml',
        'static/api/templates/params.xml',
        'static/api/templates/client.xml',
    ]

addon = AppConfig()
