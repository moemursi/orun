from orun.db import models

MENU_SEP = '/'


class Menu(models.Model):
    name = models.CharField(null=False, translate=True)
    sequence = models.IntegerField(default=99)
    parent = models.ForeignKey('self', related_name='children')
    action = models.ForeignKey('ir.action')
    groups = models.ManyToManyField('auth.group')
    icon = models.CharField(256)

    class Meta:
        name = 'ui.menu'
        ordering = ('sequence',)
        field_groups = {
            'list_fields': ['name', 'sequence', 'parent', 'action']
        }

    def __str__(self):
        return self.get_full_name()

    def get_absolute_url(self):
        if self.action_id:
            return '#/action/%s/' % self.action_id
        elif self.parent:
            return '#'
        return '/web/menu/%s/' % self.pk

    def get_full_name(self):
        parent = self.parent
        objs = [self.name]
        while parent:
            objs.insert(0, parent.name)
            parent = parent.parent
        return MENU_SEP.join(objs)
