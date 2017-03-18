from orun.db import models
from orun.utils.translation import gettext_lazy as _

from base.fields import GenericForeignKey
from .model import Model


class Object(models.Model):
    name = models.CharField(128, _('Object Name'), null=False)
    model = models.ForeignKey('sys.model', null=False)
    object_id = models.BigIntegerField()
    content_object = GenericForeignKey()
    app_label = models.CharField(64, null=False)
    can_update = models.BooleanField(default=True)

    class Meta:
        display_field = 'name'
        name = 'sys.object'

    @classmethod
    def get_object(cls, name):
        return cls.objects.filter(cls.name == name).one()

    @classmethod
    def get_by_natural_key(cls, name):
        return cls.get_object(name)


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


class Attachment(models.Model):
    name = models.CharField(verbose_name=_('Attachment Name'), null=False)
    file_name = models.CharField(256, verbose_name=_('File Name'), null=False)
    description = models.TextField()
    model = models.ForeignKey('sys.model', readonly=True)
    field = models.CharField()
    object_id = models.BigIntegerField(readonly=True)
    company = models.ForeignKey('res.company')
    att_type = models.CharField(16, choices=(
        ('url', 'URL'),
        ('file', _('File')),
    ))
    stored_file_name = models.CharField(512, verbose_name=_('Stored File Name'))
    url = models.CharField(1024)
    length = models.BigIntegerField()
    checksum = models.CharField(40)
    mimetype = models.CharField(readonly=True)
    is_public = models.BooleanField(verbose_name=_('Is public document'))

    class Meta:
        name = 'sys.attachment'


class Association(models.Model):
    source_content = models.ForeignKey('sys.model')
    source_id = models.BigIntegerField()
    source_object = GenericForeignKey('source_content', 'source_id')
    target_content = models.ForeignKey('sys.model')
    target_id = models.BigIntegerField()
    target_object = GenericForeignKey('target_content', 'target_id')
    comment = models.TextField()

    class Meta:
        name = 'sys.association'
