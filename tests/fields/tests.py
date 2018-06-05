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

        app.create_all()

        cls.Author = Author
        cls.Book = Book
