from orun.db import models


class Menu(models.Model):
    name = models.CharField(null=False)
    sequence = models.IntegerField()
    parent = models.ForeignKey('self')
    action = models.ForeignKey('sys.action')
    groups = models.ManyToManyField('auth.group')
    icon = models.CharField(256)

    class Meta:
        name = 'ui.menu'
