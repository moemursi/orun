from collections import defaultdict
from sqlalchemy.sql import or_, text
from orun import SUPERUSER, g
from orun.db import models, session


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

    def search_visible_items(self):
        qs = self.objects.filter(self.c.action_id is not None)
        if self.env.user_id == SUPERUSER or self.env.user.is_superuser:
            return qs
        Group = self.env['auth.group']
        UserGroups = self.env['auth.user.groups.rel']
        MenuGroups = self.env['ui.menu.groups.rel']
        q = MenuGroups.objects.join(Group).join(UserGroups)
        q = q.filter(
            UserGroups.c.from_auth_user_id == self.env.user_id, MenuGroups.c.from_ui_menu_id == self.c.pk
        )
        items = qs.filter(
            or_(~MenuGroups.objects.filter(MenuGroups.c.from_ui_menu_id == self.c.pk).exists(), q.exists())
        ).all()
        visible_items = defaultdict(list)
        for item in items:
            visible_items[item.parent_id].append(item)

        def _iter_item(item):
            return [
                {
                    'pk': menu_item.pk, 'name': menu_item.name, 'url': menu_item.get_absolute_url(),
                    'children': _iter_item(menu_item.pk)
                }
                for menu_item in visible_items[item]
            ]

        return _iter_item(None)

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
