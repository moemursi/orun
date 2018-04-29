from orun.db import models
from orun import api


class Author(models.Model):
    name = models.CharField()

    class Meta:
        verbose_name = 'Author'


class Book(models.Model):
    title = models.CharField()

    class Meta:
        pass


class ChangeModel(models.Model):
    """
    Test onchange field event.
    """
    name = models.CharField()
    change_field = models.CharField()
    change_field2 = models.CharField(onchange='change_field_event')

    @api.onchange(change_field)
    def change_field_event(self):
        print('field changed')
