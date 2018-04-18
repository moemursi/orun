from orun.db import models


class Author(models.Model):
    name = models.CharField()

    class Meta:
        verbose_name = 'Author'


class Book(models.Model):
    title = models.CharField()

    class Meta:
        pass
