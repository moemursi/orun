import unittest

from orun import Application, env, app
from orun.db import models


class ModelsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Application('test_app')
        self.app.config['TESTING'] = True

    def test_field_inheritance(self):

        class Model1(models.Model):
            name = models.CharField(null=False, verbose_name='My Name')

        class Model2(Model1):
            name = models.CharField(null=True)
            code = models.CharField(null=False)

        class Model3(Model1):
            foreign_field = models.CharField()

            class Meta:
                name = 'db.model3'

        Model1._build_model(app)
        Model2._build_model(app)
        Model3._build_model(app)

        model1 = Model1._meta.get_model()
        model2 = Model2._meta.get_model()

        self.assertFalse(Model1._meta.get_field('name').null)
        self.assertTrue(Model2._meta.get_field('name').null)
        self.assertTrue(model1._meta.get_field('name').null)
        self.assertTrue(model2._meta.get_field('name').null)
        self.assertEqual(model1._meta.get_field('name').verbose_name, 'My Name')
