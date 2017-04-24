from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Attachment(models.Model):
    TYPE = (
        ('url', 'URL'),
        ('file', _('File')),
    )
    name = models.CharField(label=_('Attachment Name'), null=False)
    file_name = models.CharField(label=_('File Name'))
    description = models.TextField(label=_('Description'))
    model_name = models.CharField(128, label=_('Model'))
    model_field = models.CharField(128)
    object_name = models.CharField()
    object_id = models.BigIntegerField()
    company = models.ForeignKey('res.company')
    attachment_type = models.SelectionField(TYPE, default='file')
    url = models.URLField()
    is_public = models.BooleanField(default=False)
    content = models.BinaryField(getter='get_content', setter='set_content')
    db_content = models.BinaryField()
    stored_file_name = models.CharField(label=_('Stored Filename'))
    file_size = models.BigIntegerField()
    checksum = models.CharField(40, db_index=True)
    mimetype = models.CharField(128, 'Mime Type', readonly=True)
    indexed_content = models.TextField()

    class Meta:
        name = 'sys.attachment'
        index_together = (('model_name', 'obj_name'),)

    def get_content(self):
        pass

    def set_content(self, value):
        pass

    def get_storage(self):
        return 'fs'

    def get_file_store(self):
        return 'd:/home/orun'
