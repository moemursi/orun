from orun.db import models
from orun.utils.translation import gettext_lazy as _
from mail import models as mail
from hr import models as hr


class Employee(hr.Employee):
    is_manager = models.BooleanField(default=False)
    medic_exam = models.DateField(auto_now_add=True)
    children = models.PositiveSmallIntegerField()
    vehicle = models.CharField()
    vehicle_distance = models.PositiveIntegerField()

    class Meta:
        name = 'hr.employee'
        db_schema = 'hr'


class ContractType(models.Model):
    name = models.CharField(null=False)

    class Meta:
        db_schema = 'hr'
        name = 'hr.contract.type'
        verbose_name = _('Contract Type')
        verbose_name_plural = _('Contract Types')


class Contract(mail.Thread):
    STATE = (
        ('new', 'New'),
        ('running', 'Running'),
        ('renew', 'To Renew'),
        ('expired', 'Expired'),
    )
    employee = models.ForeignKey(hr.Employee, null=False)
    department = models.ForeignKey(hr.Department)
    contract_type = models.ForeignKey(ContractType)
    job = models.ForeignKey(hr.Job, verbose_name=_('Job Title'))
    trial_date_start = models.DateField(verbose_name=_('Trial Start Date'))
    trial_date_end = models.DateField(verbose_name=_('Trial End Date'))
    date_start = models.DateField()
    date_end = models.DateField()
    calendar = models.ForeignKey('hr.calendar')
    wage = models.CurrencyField()
    advantages = models.TextField()
    notes = models.TextField()
    credit_card = models.CharField()
    credit_card_exp = models.DateField()
    state = models.CharField(16, choices=STATE)
    active = models.BooleanField(default=True)

    class Meta:
        db_schema = 'hr'
        name = 'hr.contract'
