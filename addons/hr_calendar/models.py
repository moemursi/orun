from orun.db import models
from orun.utils.translation import gettext_lazy as _
from resource import models as resource


class Status(models.Model):
    name = models.CharField(verbose_name=_('Leave Type'))


class Holiday(models.Model):
    STATE = (
        ('submit', _('To Submit')),
        ('cancel', _('Canceled')),
        ('confirm', _('To Approve')),
        ('refuse', _('Refused')),
        ('approved', _('Approved')),
    )
    TYPE = (
        ('leave', _('Leave Request')),
        ('allocation', _('Allocation Request')),
    )
    name = models.CharField(verbose_name=_('Description'))
    payslip_status = models.BooleanField(default=False)
    notes = models.TextField()
    report_message = models.TextField()
    date_from = models.DateField()
    date_to = models.DateField()
    manager = models.ForeignKey('hr.employee')
    holiday_type = models.CharField(16, choices=TYPE)
    parent = models.ForeignKey('self')
    category = models.ForeignKey('hr.employee.category')
    state = models.CharField(16, choices=STATE)

    class Meta:
        name = 'hr.calendar'


class CalendarLeave(resource.CalendarLeave):
    holiday = models.ForeignKey(Holiday)
