from orun.db import models


class Config(models.Model):
    key = models.CharField(256, null=False)
    value = models.TextField()
    groups = models.ManyToManyField('auth.group')

    class Meta:
        name = 'sys.config'
