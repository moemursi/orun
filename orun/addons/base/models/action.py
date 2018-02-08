from orun import app
from orun.db import models
from orun.utils.translation import gettext_lazy as _

from .model import Model
#from ..fields import GenericForeignKey


class Action(models.Model):
    name = models.CharField(128, _('Name'), null=False, translate=True)
    action_type = models.CharField(32, _('Action Type'), null=False)
    usage = models.TextField(verbose_name=_('Usage'))
    description = models.TextField(verbose_name=_('Description'))
    groups = models.ManyToManyField('auth.group')

    class Meta:
        name = 'ir.action'
        field_groups = {
            'list_fields': ['name', 'action_type', 'usage']
        }

    def save(self, *args, **kwargs):
        if not self.action_type:
            self.action_type = self.__class__._meta.name
        super(Action, self).save(*args, **kwargs)

    def get_action(self):
        return app[self.action_type].objects.get(self.pk)

    def execute(self):
        raise NotImplemented()


class WindowAction(Action):
    VIEW_MODE = (
        ('form', 'Form'),
        ('list', 'List'),
        ('card', 'Card'),
        ('search', 'Search'),
        ('calendar', 'Calendar'),
    )
    view = models.ForeignKey('ui.view', verbose_name=_('View'))
    domain = models.TextField(verbose_name=_('Domain'))
    context = models.TextField(verbose_name=_('Context'))
    model = models.CharField(128, null=False, label=_('Model'))
    object_id = models.BigIntegerField(verbose_name=_('Object ID'))
    #content_object = GenericForeignKey()
    view_mode = models.CharField(128, default='list,form', verbose_name=_('View Mode'))
    target = models.CharField(16, verbose_name=_('Target'), choices=(
        ('current', 'Current Window'),
        ('new', 'New Window'),
    ))
    limit = models.IntegerField(default=100, verbose_name=_('Limit'))
    auto_search = models.BooleanField(default=True, verbose_name=_('Auto Search'))
    views = models.TextField(getter='_get_views', editable=False, serializable=True)
    view_list = models.OneToManyField('ir.action.window.view')
    view_type = models.SelectionField(VIEW_MODE, default='form')

    class Meta:
        name = 'ir.action.window'
        field_groups = {
            'list_fields': ['name', 'action_type', 'usage', 'view', 'model', 'view_mode', 'limit', 'auto_search']
        }

    def _get_views(self):
        modes = self.view_mode.split(',')
        views = self.view_list.all()
        modes = {mode: None for mode in modes}
        if self.view_id:
            modes[self.view_type] = self.view_id
        for v in views:
            modes[v.view_mode] = v.view_id
        if 'search' not in modes:
            modes['search'] = None
        return modes


class WindowActionView(models.Model):
    window_action = models.ForeignKey(WindowAction, null=False)
    sequence = models.SmallIntegerField()
    view = models.ForeignKey('ui.view')
    view_mode = models.SelectionField(WindowAction.VIEW_MODE, label=_('View Type'))

    class Meta:
        name = 'ir.action.window.view'
        title_field = 'view'


class UrlAction(Action):
    url = models.TextField()
    target = models.SelectionField(
        (
            ('new', 'New Window'),
            ('self', 'Current Window'),
        ), default='new', null=False,
    )

    class Meta:
        name = 'ir.action.url'


class ServerAction(Action):

    class Meta:
        name = 'ir.action.server'


class ClientAction(Action):
    tag = models.CharField(512)
    target = models.SelectionField(
        (
            ('current', 'Current Window'),
            ('new', 'New Window'),
            ('fullscreen', 'Full Screen'),
            ('main', 'Main Action of Current Window'),
        ), default='current',
    )
    model = models.ForeignKey('ir.model', null=False, label=_('Model'))
    context = models.TextField()
    params = models.TextField()

    class Meta:
        name = 'ir.action.client'
