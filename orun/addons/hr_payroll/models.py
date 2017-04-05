from orun.db import models
from orun.utils.translation import gettext_lazy as _
import hr_contract.models


class Structure(models.Model):
    name = models.CharField(128, label=_('Name'), null=False)
    reference = models.CharField(64, label=_('Reference'))
    company = models.ForeignKey('res.company', copy=False)
    notes = models.TextField(_('Notes'))
    parent = models.ForeignKey('self')

    class Meta:
        name = 'hr.payroll.structure'


class Contract(hr_contract.models.Contract):
    structure = models.ForeignKey(Structure)
    schedule_pay = models.CharField(16, choices=(
        ('monthly', _('Monthly')),
        ('quarterly', _('Quarterly')),
        ('semi-annually', _('Semi-Annually')),
        ('annually', _('Annually')),
        ('weekly', _('Weekly')),
        ('bi-weekly', _('Bi-weekly')),
        ('bi-monthly', _('Bi-monthly')),
    ), label=_('Scheduled Pay'), default='monthly')


class RuleCategory(models.Model):
    name = models.CharField(128, label=_('Name'), null=False)
    code = models.CharField(32, label=_('Code'), null=False)
    parent = models.ForeignKey('self')
    notes = models.TextField(_('Notes'))
    company = models.ForeignKey('res.company')

    class Meta:
        name = 'hr.rule.category'
        verbose_name = _('Salary Rule Category')


class SalaryRule(models.Model):
    name = models.CharField(128, label=_('Name'), null=False)
    code = models.CharField(16, label=_('Code'), null=False)
    active = models.BooleanField(_('Active'))
    sequence = models.IntegerField()
    qty = models.DecimalField()
    category = models.ForeignKey(RuleCategory, null=False)
    appears_on_payslip = models.BooleanField(default=True)
    parent_rule = models.ForeignKey('self')
    company = models.ForeignKey('res.company')
    condition_select = models.CharField(16, choices=(
        ('true', _('Always True')),
        ('range', _('Range')),
        ('sql', _('SQL Expression')),
        ('python', _('Python Expression')),
    ))
    amount_select = models.CharField(16, choices=(
        ('%', _('Percentage (%)')),
        ('$', _('Fixed Amount ($)')),
        ('worked days', _('Quantity of Worked Days')),
        ('worked hours', _('Quantity of Worked Hours')),
        ('basic%', _('% of Basic Salary')),
    ))
    qty_value = models.DecimalField()
    amount_value = models.DecimalField()

    class Meta:
        name = 'hr.salary.rule'


class PayslipBatch(models.Model):
    STATE = (
        ('draft', _('Draft')),
        ('closed', _('Closed')),
    )
    name = models.CharField()
    state = models.CharField(16, choices=STATE, default='draft')
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        name = 'hr.payslip.batch'


class Payslip(models.Model):
    STATE = (
        ('draft', _('Draft')),
        ('waiting', _('Waiting')),
        ('done', _('Done')),
        ('rejected', _('Rejected')),
    )
    structure = models.ForeignKey(Structure)
    employee = models.ForeignKey('hr.employee', null=False)
    date_from = models.DateField()
    date_to = models.DateField()
    state = models.CharField(16, choices=STATE, copy=False, default='draft')
    paid = models.BooleanField(_('Paid'), help_text=_('Made payment order?'), copy=False)
    payslip_batch = models.ForeignKey(PayslipBatch)


class PayslipLine(models.Model):
    payslip = models.ForeignKey(Payslip, null=False)
    salary_rule = models.ForeignKey(SalaryRule, null=False)
    rate = models.DecimalField()
    amount = models.DecimalField()
    qty = models.DecimalField()
    total = models.DecimalField()

    class Meta:
        name = 'hr.payslip.line'
