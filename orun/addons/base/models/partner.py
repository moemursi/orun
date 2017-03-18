from orun.db import models
from orun.utils.translation import gettext_lazy as _


class PartnerCategory(models.Model):
    name = models.CharField(128, _('name'))
    color = models.IntegerField()

    class Meta:
        name = 'res.partner.category'


class PartnerTitle(models.Model):
    name = models.CharField(128, _('name'), null=False)
    abbreviation = models.CharField(32, _('abbreviation'), localize=True)

    class Meta:
        name = 'res.partner.title'


class Partner(models.Model):
    name = models.CharField(128, _('name'))
    title = models.ForeignKey(PartnerTitle)
    active = models.BooleanField(default=True)
    color = models.IntegerField()
    user = models.ForeignKey('auth.user')
    language = models.ForeignKey('res.language')
    email = models.EmailField()
    website = models.URLField()
    comments = models.TextField()
    barcode = models.CharField(verbose_name=_('barcode'))
    is_customer = models.BooleanField(default=False)
    is_supplier = models.BooleanField(default=False)
    is_employee = models.BooleanField(default=False)
    address = models.CharField(256)
    address_2 = models.CharField(256)
    zip = models.CharField(32, _('zip'))
    city = models.CharField(128, _('city'))
    country = models.ForeignKey('res.country', on_delete=models.SET_NULL)
    state = models.ForeignKey('res.country.state', on_delete=models.SET_NULL)
    phone = models.CharField(64, _('phone'))
    fax = models.CharField(64, _('fax'))
    mobile = models.CharField(64, _('mobile'))
    birth_date = models.CharField(64, _('Birth Date'))
    is_company = models.BooleanField(default=False)
    company_type = models.CharField(16, _('Company Type'), choices=(
        ('individual', 'Individual'),
        ('company', 'Company'),
    ))
    company = models.ForeignKey('res.company', verbose_name=_('company'))

    class Meta:
        name = 'res.partner'
