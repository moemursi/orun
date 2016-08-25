import unittest

from orun import Application, env, app
from orun.db import models
from orun.db.models import api


class ModelsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Application('test_app')
        self.app.config['TESTING'] = True

    def test_inheritance(self):
        class Model1(models.Model):
            col1 = models.CharField(100, 'col 1')

            class Meta:
                name = 'model1'
                verbose_name = 'model1'

        class Model2(Model1):
            col2 = models.IntegerField()

        class Model3(Model1):
            col3 = models.IntegerField()

        self.assertEqual(Model1._meta.name, 'model1')
        self.assertEqual(Model2._meta.name, 'model1')
        self.assertEqual(Model3._meta.name, 'model1')
        self.assertEqual(Model2._meta.verbose_name, 'model1')
        self.assertEqual(Model3._meta.verbose_name, 'model1')
        self.assertEqual(Model3._meta.verbose_name_plural, 'model1s')

    def test_build_model(self):
        class Model1(models.Model):
            col1 = models.CharField(100, 'col 1')

            def method1(self):
                return 1

            class Meta:
                name = 'model1'
                verbose_name = 'model1'

        class Model2(Model1):
            col2 = models.IntegerField()

            def method2(self):
                return 2

        class Model3(Model1):
            col3 = models.IntegerField()

            def method3(self):
                return super().method2()

            def method2(self):
                return super().method2() + 1

        class Model4(Model1):
            def method4(self):
                return super().method3()

            class Meta:
                verbose_name = 'Model 4'

        self.assertEqual(Model4._meta.verbose_name, 'Model 4')

        model1 = Model1._build_model(self.app)
        model2 = Model2._build_model(self.app)
        model3 = Model3._build_model(self.app)
        model4 = Model4._build_model(self.app)

        print(model1._meta.extension)
        self.assertEqual(model1._meta.name, 'model1')
        self.assertEqual(model2._meta.name, 'model1')
        self.assertEqual(model3._meta.name, 'model1')
        self.assertEqual(model3._meta.verbose_name, model1._meta.verbose_name)
        self.assertEqual(model4._meta.name, 'model1')
        self.assertEqual(model4._meta.verbose_name, 'Model 4')
        self.assertEqual(model4._meta.verbose_name_plural, 'model1s')
        self.assertEqual(len(model1._meta.fields), 2)
        self.assertEqual(len(model2._meta.fields), 3)
        self.assertEqual(len(model3._meta.fields), 4)
        self.assertEqual(len(model4._meta.fields), 4)
        gm = self.app['model1']
        self.assertEqual(len(gm._meta.fields), 4)
        self.assertEqual(gm._meta.verbose_name, 'Model 4')
        obj = gm()
        self.assertEqual(obj.method1(), 1)
        self.assertEqual(obj.method2(), 3)
        self.assertEqual(obj.method3(), 2)
        self.assertEqual(obj.method4(), 2)

    def test_foreignkey(self):
        class Model1(models.Model):
            name = models.CharField(max_length=100)

            class Meta:
                name = 'model1'

        class Model1_2(Model1):
            description = models.CharField(max_length=100)

        class Model2(models.Model):
            obj1 = models.ForeignKey(Model1)

        model1 = Model1._build_model(self.app)
        model1_2 = Model1_2._build_model(self.app)
        model2 = Model2._build_model(self.app)

        with self.app.app_context():
            rel_model = self.app.get_model(model2.obj1.field.related_model)
            self.assertEqual(len(rel_model._meta.local_fields), 3)

    def test_connection(self):
        class Model1(models.Model):
            name = models.CharField(max_length=100)
            calc_field = models.FloatField(compute=lambda x: 100.20)
            stored_calc_field = models.FloatField(compute=lambda x: 10.10, store=True)
            upper = models.CharField(compute='comp_upper')

            @api.depends('name')
            def comp_upper(self):
                self.upper = self.name.upper()

            class Meta:
                name = 'model1'

        class Model2(models.Model):
            name = models.CharField(max_length=100)
            model1 = models.ForeignKey(Model1)
            model1_calc_field = models.FloatField(related='model1.calc_field')

            class Meta:
                name = 'model2'
                ordering = ('-id',)

        model1 = Model1._build_model(self.app)
        model2 = Model2._build_model(self.app)
        from orun.db import connection

        with self.app.app_context(foo='test'):
            c = connection.cursor()
            c.execute('create table model1 (id int, name varchar(100), stored_calc_field decimal(10,2))')
            c.execute('create table model2 (id int, model1_id int, name varchar(100))')
            c.execute('insert into model1 (id, name) values (1, %s)', ['Model 1 - Record 1'])
            c.execute('insert into model2 (id, model1_id, name) values (1, 1, %s)', ['Model 2 - Record 1'])

            # Inserting via ORM
            obj = model1()
            obj.id = 2
            obj.name = 'Model 1 - Record 2'
            obj.save()
            obj = model1.objects.create(id=3, name='Model 1 - Record 3')

            obj2 = model2.objects.create(id=2, model1_id=2, name='Model 2 - Record 2')

            obj2 = model2()
            obj2.id = 3
            obj2.model1 = obj
            obj2.name = 'Model 2 - Record 3'
            obj2.save()

            self.assertEqual(model1.objects.count(), 3)
            self.assertEqual(model2.objects.count(), 3)

            objs = model1.objects.all()
            for obj in objs:
                print(obj, obj.upper)
                self.assertEqual(obj.name.upper(), obj.upper)
                self.assertEqual(obj.calc_field, 100.20)

            objs = model2.objects.all()
            for obj in objs:
                print(obj, obj.model1)
                self.assertEqual(obj.model1_calc_field, 100.20)

            objs = model2.objects.all().order_by('id')
            for obj in objs:
                print(obj, obj.model1)

            objs = model2.search_by_name('record 3')
            for obj in objs:
                self.assertEqual(obj.id, 3)

            # Test aggregation
            obj = model1.objects.all().aggregate(sum_id=models.Sum('id'))
            self.assertEqual(obj['sum_id'], 6)

    def test_query(self):
        from orun.db import connection
        c = connection.cursor()
        c.execute('SELECT 1 as id')
        self.assertEqual(c.fetchone()[0], 1)
        c.execute("SELECT 'str' as str")
        self.assertEqual(c.fetchone()[0], 'str')

    def test_link_inheritance(self):
        from orun.db import models, connection

        class Model1(models.Model):
            name = models.CharField()

            class Meta:
                name = 'test.model1'

        class Model2(Model1):
            description = models.CharField()

            class Meta:
                name = 'test.model2'

        with connection.schema_editor() as editor:
            editor.create_model(Model1)
            editor.create_model(Model2)
            print(Model2.objects.all().query)
            m1 = Model1._build_model(app)
            m2 = Model2._build_model(app)
            m1.objects.create(name='Model 1 - Record 1')
            print(m2.objects.all().query)
            obj = m2(name='Model 2 - Record 1', description='Model 2 Description Record 1')
            obj.save()
            m2.objects.create(name='Model 2 - Record 2', description='Model 2 Description Record 2')
            m2.objects.create(name='Model 2 - Record 3', description='Model 2 Description Record 3')
            self.assertEqual(m1.objects.all().count(), 4)
            self.assertEqual(m2.objects.all().count(), 3)
            for obj in m1.objects.all():
                print('inheritance', obj.name)
            for obj in m2.objects.all():
                print('inheritance', obj.name)


if __name__ == '__main__':
    unittest.main()
