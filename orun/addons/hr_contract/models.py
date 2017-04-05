from orun.db import models
from orun.utils.translation import gettext_lazy as _
import hr.models


class Employee(hr.models.Employee):
    is_manager = models.BooleanField(_('Is Manager'), help_text=_('Indicates if the employee is a manager'))
    medic_exam = models.DateField(label=_('Medical Examination Date'))
    place_of_birth = models.CharField(128, label=_('Place of Birth'))
    vehicle_ref = models.CharField(64, label=_('Company Vehicle'))
    vehicle_distance = models.IntegerField(label=_('Home-Work Distance'), help_text=_('In kilometers'))
    children = models.IntegerField(label=_('Number of Children'))


class ContractType(models.Model):
    name = models.CharField(128, label=_('Name'), null=False)

    class Meta:
        name = 'hr.contract.type'
        verbose_name = _('Contract Type')
        verbose_name_plural = _('Contract Types')


class Contract(models.Model):
    name = models.CharField(256, label=_('Contract Reference'), null=False)
    employee = models.ForeignKey(Employee, label=_('Employee'), null=False)
    department = models.ForeignKey(hr.models.Department, label=_('Department'))
    contact_type = models.ForeignKey(ContractType, null=False)
    job = models.ForeignKey(hr.models.Job, label=_('Job Title'))
    date_start = models.DateField(_('Start Date'))
    date_end = models.DateField(_('End Date'))
    trial_start_date = models.DateField(_('Trial Start Date'))
    trial_end_date = models.DateField(_('Trial End Date'))
    working_hours = None
    wage = models.DecimalField(label=_('Wage'), help_text=_('Basic salary of the employee'))
    advantages = models.TextField(_('Advantages'))
    notes = models.TextField(_('Notes'))
    permit_no = models.CharField(64, label=_('Work Permit No'))
    visa_no = models.CharField(label=_('Visa No'))
    visa_expiration = models.DateField(_('Visa Expiration Date'))
    state = models.CharField(16, choices=(
        ('draft', _('Draft')),
        ('running', _('Running')),
        ('to renew', _('To Renew')),
        ('expired', _('Expired')),
    ), label=_('Status'))

    class Meta:
        name = 'hr.contract'
