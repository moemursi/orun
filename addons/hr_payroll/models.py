from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Structure(models.Model):
    company = models.ForeignKey('res.company', null=False)
    name = models.CharField(null=False)
    code = models.CharField(64)
    description = models.TextField()
    parent = models.ForeignKey('self')

    class Meta:
        name = 'hr.payroll.structure'


class Category(models.Model):
    company = models.ForeignKey('res.company', null=False)
    name = models.CharField(null=False)
    code = models.CharField(64)
    parent = models.ForeignKey('self')
    description = models.TextField()

    class Meta:
        name = 'hr.salary.rule.category'


class Rule(models.Model):
    RULE_TYPE = (
        ('%', _('Percentage (%)')),
        ('$', _('Fixed Amount')),
        ('sql', _('SQL Formula')),
        ('code', _('Python Code')),
    )
    name = models.CharField(null=False)
    description = models.TextField()
    code = models.CharField(64)
    active = models.BooleanField(default=True)
    sequence = models.IntegerField()
    category = models.ForeignKey(Category)
    parent = models.ForeignKey('self')
    rule_type = models.CharField(16, choices=RULE_TYPE)
    amount = models.DecimalField()
    reference = models.DecimalField()
    quantity = models.CharField()
    visible = models.BooleanField(default=True)

    class Meta:
        name = 'hr.salary.rule'


class PayrollType(models.Model):
    name = models.CharField(null=False)
    parent = models.ForeignKey('self')
    active = models.BooleanField(default=True)

    class Meta:
        name = 'hr.payroll.type'


class PayrollTypeRule(models.Model):
    payroll_type = models.ForeignKey(PayrollType, null=False)
    rule = models.ForeignKey('hr.salary.rule', null=False)

    class Meta:
        name = 'hr.payroll.type.rule'


class Payroll(models.Model):
    payroll_type = models.ForeignKey(PayrollType)
    date_from = models.DateField()
    date_to = models.DateField()
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField()
    sequence = models.PositiveSmallIntegerField()

    class Meta:
        name = 'hr.payroll'


class Payslip(models.Model):
    STATE = (
        ('draft', _('Draft')),
        ('verify', _('Verify')),
        ('done', _('Done')),
        ('rejected', _('Rejected')),
    )
    structure = models.ForeignKey(Structure, null=False)
    name = models.CharField()
    reference = models.CharField()
    contract = models.ForeignKey('hr.contract', null=False)
    payroll = models.ForeignKey(Payroll, null=False)
    date_from = models.DateField()
    date_to = models.DateField()
    state = models.CharField(16, choices=STATE)
    paid = models.BooleanField(default=False)
    message = models.TextField()

    class Meta:
        name = 'hr.payslip'
        verbose_name = _('Payslip')


class PayslipLine(models.Model):
    payslip = models.ForeignKey(Payslip)
    rate = models.DecimalField(null=False, default=0)
    amount = models.CurrencyField(null=False, defualt=0)
    total = models.CurrencyField(null=False, default=0)
    quantity = models.CharField()

    class Meta:
        name = 'hr.payslip.line'
        verbose_name = _('Payslip Line')
