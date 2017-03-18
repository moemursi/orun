from orun import app
from orun.db import models
from orun.utils.translation import gettext_lazy as _

from .model import Model
#from ..fields import GenericForeignKey


class Action(models.Model):
    name = models.CharField(128, _('Name'), null=False)
    action_type = models.CharField(32, _('Action Type'), null=False)
    usage = models.TextField(verbose_name=_('Usage'))
    description = models.TextField(verbose_name=_('Description'))

    class Meta:
        name = 'sys.action'

    def save(self, *args, **kwargs):
        if not self.action_type:
            self.action_type = self.__class__._meta.name
        super(Action, self).save(*args, **kwargs)

    def get_action(self):
        return app[self.action_type].objects.get(self.pk)

    def execute(self):
        raise NotImplemented()


class WindowAction(Action):
    view = models.ForeignKey('ui.view', verbose_name=_('View'))
    domain = models.TextField(verbose_name=_('Domain'))
    context = models.TextField(verbose_name=_('Context'))
    model = models.ForeignKey('sys.model', null=False, verbose_name=_('Model'))
    object_id = models.BigIntegerField(verbose_name=_('Object ID'))
    #content_object = GenericForeignKey()
    view_mode = models.CharField(128, default='list,form', verbose_name=_('View Mode'))
    target = models.CharField(16, verbose_name=_('Target'), choices=(
        ('current', 'Current Window'),
        ('new', 'New Window'),
    ))
    limit = models.IntegerField(default=100, verbose_name=_('Limit'))
    auto_search = models.BooleanField(default=True, verbose_name=_('Auto Search'))

    class Meta:
        name = 'sys.action.window'


class ReportAction(Action):
    report_type = models.CharField(32, null=False, verbose_name=_('Report Type'))
    report_name = models.CharField(256, null=False, verbose_name=_('Report Name'))

    class Meta:
        name = 'sys.action.report'


class ServerAction(Action):

    class Meta:
        name = 'sys.action.server'
