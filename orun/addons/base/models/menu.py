from orun.db import models


class Menu(models.Model):
    name = models.CharField(null=False)
    sequence = models.IntegerField(default=99)
    parent = models.ForeignKey('self')
    action = models.ForeignKey('sys.action')
    groups = models.ManyToManyField('auth.group')
    icon = models.CharField(256)

    class Meta:
        name = 'ui.menu'
        ordering = ('sequence', 'name')

    def __str__(self):
        return self.get_full_name()

    def get_absolute_url(self):
        if self.parent:
            if self.action_id:
                return '#/action/%s/' % self.action_id
            else:
                return '#'
        return '/web/menu/%s/' % self.pk

    def get_full_name(self):
        parent = self.parent
        objs = [self.name]
        while parent:
            objs.insert(0, parent.name)
            parent = parent.parent
        return ' / '.join(objs)
