from orun.db import models
from orun.utils.translation import gettext_lazy as _
import resource.models


class Tag(models.Model):
    name = models.CharField(max_length=128, label=_('Employee Tag'), null=False)
    color = models.IntegerField()

    class Meta:
        name = 'hr.employee.tag'


class Department(models.Model):
    company = models.ForeignKey('res.company')
    name = models.CharField(128, label=_('Department Name'), null=False)
    active = models.BooleanField(label=_('Active'))
    parent = models.ForeignKey('self')
    notes = models.TextField(label=_('Notes'))
    color = models.IntegerField(label=_('Color Index'))

    class Meta:
        name = 'hr.department'


class Job(models.Model):
    name = models.CharField(128, label=_('Job Title'), null=False)
    description = models.TextField(label=_('Job Description'))
    requirements = models.TextField(label=_('Requirements'))
    department = models.ForeignKey(Department, label=_('Department'))

    class Meta:
        name = 'hr.job'
        verbose_name = _('Job Position')
        verbose_name_plural = _('Job Positions')


class Employee(resource.models.Resource):
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
    partner = models.OneToOneField('res.partner', null=False)
    country = models.ForeignKey('res.country', label=_('Nationality (Country)'))
    ssn = models.CharField(64, label=_('SSN No'), help_text=_('Social Security Number'))
    sin = models.CharField(64, label=_('SIN No'), help_text=_('Social Insurance Number'))
    passport_id = models.CharField(64, label=_('Passport No'))
    identification = models.CharField(64, label=_('Identification No'))
    gender = models.CharField(16, label=_('Gender'), choices=GENDER)
    marital = models.CharField(16, label=_('Marital Status'), choices=MARITAL)
    department = models.ForeignKey(Department, label=_('Department'))
    working_address = models.ForeignKey('res.partner', label=_('Working Address'))
    home_address = models.ForeignKey('res.partner', label=_('Home Address'))
    work_phone = models.CharField(label=_('Work Phone'))
    mobile_phone = models.CharField(label=_('Mobile Phone'))
    work_email = models.EmailField(label=_('Work Email'))
    work_location = models.CharField(label=_('Work Location'))
    manager = models.ForeignKey('self', label=_('Manager'))
    coach = models.ForeignKey('self', label=_('Coach'))
    job = models.ForeignKey(Job, label=_('Job Title'))
    color = models.IntegerField(_('Color Index'))
    tags = models.ManyToManyField(Tag)
    notes = models.TextField(label=_('Notes'))

    class Meta:
        name = 'hr.employee'
        verbose_name = _('Employee')
        verbose_name_plural = _('Employees')
