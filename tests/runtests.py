import unittest

from orun.apps import Application


app = Application('test_app', settings={'USE_I18N': True, 'ADDONS': ['base'], 'DATABASES': {'default': {'ENGINE': 'sqlite://'}}})
app.config['TESTING'] = True
with app.app_context():
    suite = unittest.TestSuite()
    tests = ['tests.trans.appcontext']
    for t in tests:
        suite.addTest(unittest.defaultTestLoader.loadTestsFromName(t))
    unittest.TextTestRunner().run(suite)
