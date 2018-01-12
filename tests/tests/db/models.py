from unittest import TestCase
from sqlalchemy.ext.hybrid import hybrid_property
from orun import app


class ModelsTestCase(TestCase):
    """
    Basic ORM tests
    """
    def test_recreate(self):
        from orun.core.management.commands import recreatedb
        recreatedb.recreate()
        app.create_all()
        app.load_fixtures()

        obj = app['ir.object'].get_by_natural_key('ir.module.category.accounting')
        obj.name += ' 1'
        obj.save()
        obj = app['ir.object'].objects.filter(app['ir.object'].c.name == 'ir.module.category.accounting 1').first()
        self.assertIsNotNone(obj)

    def test_models(self):
        from orun.core.management.commands import recreatedb
        recreatedb.recreate()
        app.meta.create_all(app.db_engine)
        app._register_models()
        app.load_fixtures()
        p = app['res.partner']
        obj = app['ir.object'].get_by_natural_key('ir.module.category.accounting')
        obj.name += ' 1'
        obj.save()
        obj = app['ir.object'].objects.filter(app['ir.object'].name == 'ir.module.category.accounting 1').one()

    def test_design(self):
        from orun.db.models import Model, CharField, ForeignKey, IntegerField, OneToManyField, ManyToManyField

        from orun.core.management.commands import recreatedb
        recreatedb.recreate()

        class Author(Model):
            name = CharField(100, 'name', null=False)
            books = OneToManyField('Book', )

            class Meta:
                db_table = 'author'

        class Book(Model):
            name = CharField(30, 'name', null=False)
            author = ForeignKey(Author, lazy='joined')

            class Meta:
                db_table = 'book'

        class Interval(Model):
            start = IntegerField()
            end = IntegerField()

            @hybrid_property
            def length(self):
                return self.end - self.start

            class Meta:
                db_table = 'interval'

        class Friend(Model):
            name = CharField()

            class Meta:
                db_table = 'friend'

        class ModelA(Model):
            name = CharField()

            class Meta:
                db_table = 'model_a'
                field_groups = {
                    'printable_fields': '*',
                }

        class ModelB(ModelA):
            description = CharField()
            friend = ForeignKey(Friend)

            class Meta:
                name = 'db.modelb'
                db_table = 'db_modelb'

        from base.models import Menu

        new_models = [Author, Book, Interval, Friend, ModelA, ModelB]
        models = [model._meta._build_model(app) for model in new_models]
        app.models['Author'] = models[0]
        app.models['Book'] = models[1]
        app.models['Interval'] = models[2]
        app.models['Friend'] = models[3]
        app.models['ModelA'] = models[4]
        app.models['ModelB'] = models[5]
        for model in models:
            model._meta._build_table(app.meta)

        for model in models:
            model._meta._build_mapper()

        app.create_all()

        self.assertIsNotNone(Author._meta.db_table)
        self.assertIsNotNone(Book._meta.db_table)
        self.assertIsNotNone(Interval._meta.db_table)
        self.assertIsNotNone(Friend._meta.db_table)
        self.assertIsNotNone(ModelA._meta.db_table)
        self.assertIsNotNone(ModelB._meta.db_table)
        self.assertIsNotNone(Menu._meta.name)

        Author = app['Author']

        Author.insert.values(name='Author 1')
        for r in Author.select.where(name='Author 1'):
            print(r)

        Author.select.where(name='Author 1').update.values(name='Author 2')
        for r in Author.select.where(name='Author 2'):
            print(r)

        a = Author.select.order_by('name').first()
        self.assertEqual(a.id, 1)

        for r in Author.select.order_by('pk'):
            print('pk', r.id)

        Author.update.values(name='Author 1')
        for r in Author.select.where(name='Author 1').order_by('pk'):
            print('pk', r.id)

        Book = app['Book']

        Book.insert.values(name='Book 1', author_id=1)
        Book.insert.values(name='Book 2', author_id=1)
        Book.insert.values(name='Book 3', author_id=1)
        Book.insert.values(name='Book 4')

        obj = Book.objects.filter_by(name='Book 2').first()
        self.assertEqual(obj.pk, 2)
        self.assertEqual(obj.name, 'Book 2')
        self.assertEqual(obj.author.pk, 1)
        self.assertEqual(obj.author.name, 'Author 1')

        for book in obj.author.books:
            print(book.name)

        obj.author.books.append(Book.objects.filter_by(id=4).one())

        for book in obj.author.books:
            print(book.name)

        Interval = app['Interval']

        Interval.insert.values(start=10, end=123)
        for r in Interval.objects.filter(Interval.length > 1):
            print(r.pk, r.length)

        Friend = app['Friend']

        Friend.insert.values(name='Friend 1')
        Friend.insert.values(name='Friend 2')
        Friend.insert.values(name='Friend 3')
        Friend.insert.values(name='Friend 4')
        friend = Friend.objects.first()
        self.assertIsNotNone(friend)

        ModelA = app['ModelA']
        ModelA.insert.values(name='Model A.1')

        ModelB = app['ModelB']
        ModelB.insert.values(modela_ptr_id=1, description='Model B.1')
        obj = ModelB.objects.first()
        self.assertEqual(obj.name, 'Model A.1')
        self.assertEqual(obj.description, 'Model B.1')
