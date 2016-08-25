from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Country(models.Model):
    name = models.CharField(128, _('name'), null=False)
    code = models.CharField(2, _('Country Code'))
    address_format = models.TextField(_('Address Format'))
    phone_code = models.PositiveSmallIntegerField()
    image_flag = models.CharField(256)

    class Meta:
        name = 'res.country'


class CountryGroup(models.Model):
    name = models.CharField(128, _('name'), null=False)
    countries = models.ManyToManyField(Country)

    class Meta:
        name = 'res.country.group'


class CountryState(models.Model):
    country = models.ForeignKey(Country, null=False)
    name = models.CharField(128, _('name'), null=False)
    code = models.CharField(3, _('State Code'), null=False)

    class Meta:
        name = 'res.country.state'


class Language(models.Model):
    name = models.CharField(128, _('name'), null=False)
    code = models.CharField(16, _('Locale Code'))
    iso_code = models.CharField(16, _('ISO Code'))
    active = models.BooleanField(default=True)

    class Meta:
        name = 'res.language'


class Currency(models.Model):
    name = models.CharField(3, _('currency'), null=False)
    symbol = models.CharField(4, _('symbol'))
    rounding = models.FloatField(_('Rounding Factor'))

    class Meta:
        name = 'res.currency'
