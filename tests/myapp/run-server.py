import os
os.environ['ORUN_ADDONS_PATH'] = os.path.dirname(__file__)
from orun.apps import Application


DB_NAME = 'db.sqlite3'
conn_str = 'sqlite:///' + DB_NAME


MODULES = ['mail', 'myapp']

base_settings = {
    'ADDONS': MODULES,
    'USE_I18N': True,
    'SQL_DEBUG': False,
    'LANGUAGE_CODE': 'pt-br',
    'DATABASE_SCHEMA_SUPPORT': False,
    'DEBUG': True,
    'SECRET_KEY': 'YOUR-SECRET-KEY',
    'REPORT_PATH': '/home/alexandre/tmp/reports/',
    'DATABASES': {
        'default': {'ENGINE': conn_str}
    },
}


app = Application('myapp', settings=base_settings)

if __name__ == '__main__':
    with app.app_context():
        app.cli()
