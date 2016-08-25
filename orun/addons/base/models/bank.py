from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Bank(models.Model):
    name = models.CharField(null=False)
    code = models.CharField(verbose_name=_('Bank Identifier Code'), help_text=_('BIC or Swift Code'))
    active = models.BooleanField()
    street = models.CharField()
    street2 = models.CharField()
    zip = models.CharField()
    city = models.CharField()
    country = models.ForeignKey('res.country')
    state = models.ForeignKey('res.country.state', verbose_name=_('Fed. State'), domain="{'country': country}")
    email = models.EmailField()
    phone = models.CharField()
    fax = models.CharField()

    class Meta:
        name = 'res.bank'


class Account(models.Model):
    number = models.CharField(verbose_name=_('Account Number'))
    bank = models.ForeignKey(Bank, null=False)
    partner = models.ForeignKey('res.partner', null=False)

    class Meta:
        name = 'res.bank.account'
