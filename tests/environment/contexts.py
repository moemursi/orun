import unittest

from orun import Application, env


class ModelsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Application('test_app')
        self.app.config['TESTING'] = True

    def test_context(self):
        with self.app.with_context(foo=1):
            self.assertEquals(env.foo, 1)
