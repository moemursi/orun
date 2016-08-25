from orun.db import models
from orun.utils.translation import gettext_lazy as _
from base import models as base
from resource import models as resource
from mail import models as mail


class EmployeeCategory(models.Model):
    name = models.CharField(null=False)
    color = models.IntegerField()

    class Meta:
        name = 'hr.employee.category'


class Job(mail.Thread):
    STATE = (
        ('recruit', _('Recruit')),
        ('open', _('Open')),
    )
    name = models.CharField(null=False)
    company = models.ForeignKey('res.company')
    description = models.TextField()
    hired_employees = models.IntegerField(verbose_name=_('Hired Employees'))
    requirements = models.TextField()
    department = models.ForeignKey('hr.department')
    active = models.BooleanField(default=True)
    state = models.CharField(choices=STATE, default='recruit')

    class Meta:
        name = 'hr.job'


class Department(models.Model):
    name = models.CharField(null=False)
    company = models.ForeignKey('res.company')
    parent = models.ForeignKey('self')
    notes = models.TextField()
    color = models.IntegerField()

    class Meta:
        name = 'hr.department'


class Employee(resource.Resource, mail.Thread):
    GENDER = (
        ('male', _('Male')),
        ('female', _('Female')),
        ('other', _('Other')),
    )
    MARITAL = (
        ('single', _('Single')),
        ('married', _('Married')),
        ('widower', _('Widower')),
        ('divorced', _('Divorced')),
    )
    categories = models.ManyToManyField(EmployeeCategory, verbose_name='Tags')
    department = models.ForeignKey(Department)
    birthday = models.DateField(verbose_name=_('Date of Birth'))
    marital = models.CharField(32)
    gender = models.CharField(16, choices=GENDER)
    working_address = models.ForeignKey('res.partner')
    work_phone = models.CharField()
    mobile_phone = models.CharField()
    work_email = models.CharField()
    work_location = models.CharField()
    manager = models.ForeignKey('self')
    job = models.ForeignKey(Job)
    passport_no = models.CharField()
    color = models.IntegerField()
    notes = models.TextField()

    class Meta:
        name = 'hr.employee'
