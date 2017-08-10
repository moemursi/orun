import unittest


class TestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        super(TestCase, cls).setUpClass()


class AddOnTestCase(TestCase):
    pass
