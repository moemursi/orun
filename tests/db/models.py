from unittest import TestCase
import sqlalchemy as sa
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import select
from orun import app


class ModelsTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = sa.create_engine('sqlite://', echo=True)

    def test_recreate(self):
        from orun.core.management.commands import recreatedb
        recreatedb.recreate()
        app._create_all()
        app.load_fixtures()

        obj = app['sys.object'].get_by_natural_key('sys.module.category.accounting')
        obj.name += ' 1'
        obj.save()
        obj = app['sys.object'].objects.filter(app['sys.object'].name == 'sys.module.category.accounting 1').one()

    def _models(self):
        #app.build_models()
        app.meta.create_all(app.db_engine)
        app._register_models()
        app.load_fixtures()
        p = app['res.partner']
        obj = app['sys.object'].get_by_natural_key('sys.module.category.accounting')
        obj.name += ' 1'
        obj.save()
        obj = app['sys.object'].objects.filter(app['sys.object'].name == 'sys.module.category.accounting 1').one()

    def b4(self):
        from orun.db.models import Model, CharField, ForeignKey, IntegerField, OneToManyField, ManyToManyField

        class Author(Model):
            name = CharField(100, 'name', null=False)
            books = OneToManyField('Book', )

        class Book(Model):
            name = CharField(30, 'name', null=False)
            author = ForeignKey(Author, lazy='joined')

        class Interval(Model):
            start = IntegerField()
            end = IntegerField()

            @hybrid_property
            def length(self):
                return self.end - self.start

        class Friend(Model):
            name = CharField()
            friends = ManyToManyField('self')

        class ModelA(Model):
            name = CharField()

            class Meta:
                db_table = 'db_table'
                field_groups = {
                    'printable_fields': '*',
                }

        class ModelB(ModelA):
            description = CharField()
            friend = ForeignKey(Friend)

            class Meta1:
                name = 'db.modelb'

        from base.models import Menu

        app.build_models()

        print(Author._meta.db_table)
        print(Book._meta.db_table)
        print(Interval._meta.db_table)
        print(Friend._meta.db_table)
        print(ModelA._meta.db_table)
        print(ModelB._meta.db_table, ModelB._meta.field_groups)
        print(Menu._meta.name)

    def b2(self):

        app.build_models()

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

        Interval.insert.values(start=10, end=123)
        for r in Interval.objects.filter(Interval.length > 1):
            print(r.pk, r.length)

        Friend.insert.values(name='Friend 1')
        Friend.insert.values(name='Friend 2')
        Friend.insert.values(name='Friend 3')
        Friend.insert.values(name='Friend 4')
        friend = Friend.objects.first()

        friend.friends.append(Friend.objects.filter_by(id=2).first())

        for f in friend.friends:
            print(friend.name, f.name)

        ModelA.insert.values(name='Model A.1')
        ModelB.insert.values(modela_ptr_id=1, description='Model B.1')

        obj = ModelB.objects.first()
        self.assertEqual(obj.name, 'Model A.1')
        self.assertEqual(obj.description, 'Model B.1')

    def _b(self):
        meta = sa.MetaData()

        author = Author._meta._build_table(meta)
        tbl = Book._meta._build_table(meta)

        # tbl = sa.Table('book', meta, sa.Column('id', sa.Integer()), sa.Column('name', sa.String))
        print('models', app.models)

        meta.create_all(app.db_engine)

        conn = app.db_engine.connect()

        conn.execute(author.insert().values(name='test'))
        conn.execute(tbl.insert().values(name='test', author=1))
        conn.execute(tbl.insert().values(name='test2'))
        r = conn.execute(select([tbl]))
        for row in r:
            print(row.author)

        Author.select.where(Author.c.name == 'test')._fetch_all(conn)
