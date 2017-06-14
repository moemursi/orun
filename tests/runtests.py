import os
import unittest
os.environ['ORUN_ADDONS_PATH'] = r'c:\workspace\katrid\myerp'

from orun.apps import Application


# app = Application('test_app', settings={'USE_I18N': True})
app = Application('test_app', settings={'USE_I18N': True, 'ADDONS': ['base'], 'DATABASES': {'default': {'ENGINE': 'sqlite://'}}})
# app = Application('test_app', settings={'USE_I18N': True, 'DATABASES': {'default': {'ENGINE': 'postgresql://postgres:1@localhost/test002'}}})
# app = Application('test_app', settings={'USE_I18N': True, 'DATABASES': {'default': {'ENGINE': 'mysql://root:1@localhost/test002'}}})
app.config['TESTING'] = True
with app.app_context():
    unittest.main('db.models')
    #unittest.main('schema.tests', failfast=True)
    #unittest.main('db.conn', failfast=True)
    #unittest.main('locales.trans', failfast=True)
