from orun import env
from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Scheduler(models.Model):
    INTERVAL_TYPE = (
        ('minute', _('Minutes')),
        ('hour', _('Hours')),
        ('work_day', _('Work Days')),
        ('day', _('Days')),
        ('week', _('Weeks')),
        ('month', _('Months')),
    )
    name = models.CharField(256, null=False)
    user = models.ForeignKey('auth.user', default=lambda x: env.user, null=False)
    active = models.BooleanField(default=True)
    interval_type = models.SelectionField(INTERVAL_TYPE, default='month')
    interval = models.PositiveIntegerField()
    limit = models.IntegerField(default=1)
    repeat_missed = models.BooleanField(default=False)
    next_call = models.DateTimeField()
    model = models.CharField(128)
    method = models.CharField(128)
    args = models.TextField()
    priority = models.IntegerField(default=9)

    class Meta:
        name = 'sys.scheduler'
