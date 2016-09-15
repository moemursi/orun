from orun.db import models
from orun.utils.translation import gettext_lazy as _


class ModuleCategory(models.Model):
    name = models.CharField(null=False)
    sequence = models.IntegerField()
    visible = models.BooleanField(default=True)

    class Meta:
        db_table = 'sys.module.category'
        verbose_name = _('Module Category')
        verbose_name_plural = _('Module Categories')


class Module(models.Model):
    name = models.CharField()
    category = models.ForeignKey(ModuleCategory, null=False)
    installable = models.BooleanField(default=False)
    installed = models.BooleanField(default=False)

    class Meta:
        name = 'sys.module'
        verbose_name = _('Module')
        verbose_name_plural = _('Modules')
