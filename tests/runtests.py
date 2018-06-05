import importlib.util
import os
import pkgutil
import unittest

import click

from orun.apps import Application


def orun_tests():
    app = Application('test_app', settings={'USE_I18N': True, 'ADDONS': ['base'], 'DATABASES': {'default': {'ENGINE': 'sqlite://'}}})
    app.config['TESTING'] = True
    with app.app_context():
        suite = unittest.TestSuite()
        modules = [pkg for pkg in pkgutil.iter_modules([os.path.dirname(__file__)])]
        tests = []
        for mod in modules:
            if mod.ispkg:
                test_name = mod.name + '.tests'
                if importlib.util.find_spec(test_name):
                    tests.append(test_name)
        for t in tests:
            suite.addTest(unittest.defaultTestLoader.loadTestsFromName(t))
        unittest.TextTestRunner().run(suite)

@click.command()
def main():
    orun_tests()


if __name__ == '__main__':
    main()
