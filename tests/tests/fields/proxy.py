from unittest import TestCase
from orun import app
from orun.db import models


class ProxyFieldTestCase(TestCase):
    @classmethod
    def setUpClass(cls):

        class Author(models.Model):
            name = models.CharField(100, 'name', null=False)

            class Meta:
                db_table = 'author'

        class Book(models.Model):
            name = models.CharField(30, 'name', null=False)
            author = models.ForeignKey(Author, lazy='joined')
            author_name = models.CharField(proxy='author.name')

            class Meta:
                db_table = 'book'

        Author = Author._meta._build_model(app)
        Book = Book._meta._build_model(app)
        app.models['Author'] = Author
        app.models['Book'] = Book

        Author._meta._build_table(app.meta)
        Book._meta._build_table(app.meta)
        Author._meta._build_mapper()
        Book._meta._build_mapper()

        app.create_all()

        cls.Author = Author
        cls.Book = Book

    def test_proxy_field(self):
        author = self.Author.create(name='William')
        book = self.Book.create(name='New Book', author=author)
        self.assertEqual(book.author_name, 'William')
