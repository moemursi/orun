from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Resource(models.Model):
    RESOURCE_TYPE = (
        ('human', _('Human')),
        ('material', _('Material')),
    )
    name = models.CharField(200, db_index=True, null=False)
    code = models.CharField(64, copy=False)
    active = models.BooleanField(default=True)
    company = models.ForeignKey('res.company')
    resource_type = models.CharField(16, choices=RESOURCE_TYPE, default='human', null=False)
    user = models.ForeignKey('auth.user')

    class Meta:
        name = 'resource.resource'
        verbose_name = _('Resource')
        verbose_name_plural = _('Resources')
