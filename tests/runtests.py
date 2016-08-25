import unittest
from orun.apps import Application


app = Application('test_app', settings={'USE_I18N': True})
app.config['TESTING'] = True
with app.app_context():
    unittest.main('db.migrations')
    #unittest.main('schema.tests', failfast=True)
    #unittest.main('db.conn', failfast=True)
    #unittest.main('locales.trans', failfast=True)
