from orun import api
from orun.db import models
from orun.utils.translation import gettext_lazy as _

from .model import Model
from ..fields import GenericForeignKey


class Action(models.Model):
    name = models.CharField(128, _('Name'), null=False)
    action_type = models.CharField(32, _('Action Type'), null=False)
    usage = models.TextField()
    description = models.TextField()

    class Meta:
        name = 'sys.action'

    def save(self, *args, **kwargs):
        if not self.action_type:
            self.action_type = self.__class__._meta.name
        super(Action, self).save(*args, **kwargs)


class WindowAction(Action):
    view = models.ForeignKey('ui.view')
    domain = models.TextField()
    context = models.TextField()
    model = models.ForeignKey(Model, null=False)
    object_id = models.BigIntegerField()
    content_object = GenericForeignKey()
    view_mode = models.CharField(128, default='list,form')
    view_type = models.CharField(16, default='form')
    target = models.CharField(16, choices=(
        ('current', 'Current Window'),
        ('new', 'New Window'),
    ))
    limit = models.PositiveIntegerField(default=100)
    auto_search = models.BooleanField(default=True)

    class Meta:
        name = 'sys.action.window'


class ReportAction(Action):
    report_type = models.CharField(32, null=False)
    report_name = models.CharField(256, null=False)

    class Meta:
        name = 'sys.action.report'


class ServerAction(Action):

    class Meta:
        name = 'sys.action.server'
