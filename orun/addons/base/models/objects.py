from orun.db import models
from orun.utils.translation import gettext_lazy as _

from base.fields import GenericForeignKey
from .model import Model


class Object(models.Model):
    name = models.CharField(128, _('Object Name'), null=False)
    model = models.CharField(128, null=False)
    object_id = models.BigIntegerField()
    content_object = GenericForeignKey()
    app_label = models.CharField(64, null=False)
    can_update = models.BooleanField(default=True)

    class Meta:
        display_field = 'name'
        name = 'sys.object'


class Property(models.Model):
    name = models.CharField(128, _('name'), null=False)
    company = models.ForeignKey('res.company', null=False)
    field = models.ForeignKey('sys.model.field', on_delete=models.CASCADE, null=False)

    float_value = models.FloatField()
    int_value = models.BigIntegerField()
    text_value = models.TextField()
    binary_value = models.BinaryField()
    ref_value = models.CharField(1024)
    datetime_value = models.DateTimeField()

    prop_type = models.CharField(16, null=False, default='foreignkey', choices=(
        ('char', 'Char'),
        ('float', 'Float'),
        ('boolean', 'Boolean'),
        ('integer', 'Integer'),
        ('text', 'Text'),
        ('binary', 'Binary'),
        ('foreignkey', 'Foreign Key'),
        ('date', 'Date'),
        ('datetime', 'Date Time'),
        ('choices', 'Choices'),
    ))

    class Meta:
        name = 'sys.property'
