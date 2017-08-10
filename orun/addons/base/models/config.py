from orun.db import models


class Config(models.Model):
    key = models.CharField(256, null=False)
    value = models.TextField()
    groups = models.ManyToManyField('auth.group')

    class Meta:
        name = 'sys.config'


class SingleLineSettings(models.Model):
    """
    Single line settings object.
    """

    class Meta:
        abstract = True


class VirtualSettings(models.Model):
    """
    Single line settings object.
    """

    class Meta:
        name = 'sys.config.settings'
        virtual = True
