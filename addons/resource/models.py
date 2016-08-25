from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Calendar(models.Model):
    name = models.CharField(null=False)
    company = models.ForeignKey('res.company')
    manager = models.ForeignKey('res.user', verbose_name=_('Workgroup Name'))

    class Meta:
        name = 'resource.calendar'


class CalendarAttendance(models.Model):
    DAY_OF_WEEK = (
        ('0', _('Sunday')),
        ('1', _('Monday')),
        ('2', _('Tuesday')),
        ('3', _('Wednesday')),
        ('4', _('Thursday')),
        ('5', _('Friday')),
        ('6', _('Saturday')),
    )
    name = models.CharField(null=False)
    calendar = models.ForeignKey(Calendar)
    day_of_week = models.CharField(16, choices=DAY_OF_WEEK)
    date_from = models.DateTimeField()
    date_to = models.DateTimeField()

    class Meta:
        name = 'resource.calendar.attendance'


class Resource(models.Model):
    TYPE = (
        ('human', _('Human')),
        ('material', _('Material'))
    )
    name = models.CharField(null=False)
    active = models.BooleanField(default=True)
    company = models.ForeignKey('res.company')
    resource_type = models.CharField(16, choices=TYPE)
    user = models.ForeignKey('auth.user')

    class Meta:
        name = 'resource.resource'
