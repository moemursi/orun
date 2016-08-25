from orun.utils.translation import gettext_lazy as _
from orun.db import models
from mail import models as mail


class UnitCategory(models.Model):
    name = models.CharField(verbose_name=_('name'))

    class Meta:
        name = 'product.unit.category'


class Unit(models.Model):
    name = models.CharField(verbose_name=_('name'), null=False)
    category = models.ForeignKey(UnitCategory)
    active = models.BooleanField(default=True)
    rounding = models.FloatField(default=0.01)
    factor = models.FloatField(default=1)
    unit_type = models.CharField(default='reference', choices=(
        ('bigger', 'Bigger than the reference'),
        ('reference', 'Reference unit of measure for this category'),
        ('smaller', 'Smaller than the reference'),
    ))

    class Meta:
        name = 'product.unit'


class Category(models.Model):
    name = models.CharField(verbose_name=_('name'), null=False)

    class Meta:
        name = 'product.category'


class Template(mail.Thread):
    name = models.CharField(verbose_name=_('name'), null=False)
    active = models.BooleanField(default=True)
    category = models.ForeignKey(Category)
    manager = models.ForeignKey('auth.user')
    rental = models.BooleanField(default=False)
    sale_ok = models.BooleanField(default=True)
    sale_unit = models.ForeignKey(Unit)
    purchase_unit = models.ForeignKey(Unit)
    state = models.CharField(choices=(
        ('development', _('Development')),
        ('production', _('Production')),
        ('end', _('End of Lifecycle')),
        ('obsolete', _('Obsolete')),
    ))
    color = models.IntegerField()

    class Meta:
        name = 'product.template'


class Item(models.Model):
    template = models.ForeignKey(Template, null=False)

    class Meta:
        name = 'product.item'


class PriceList(models.Model):
    name = models.CharField(verbose_name=_('name'), null=False)
    active = models.BooleanField(default=True)
    currency = models.ForeignKey('res.currency')

    class Meta:
        name = 'product.price.list'


class Attribute(models.Model):
    name = models.CharField(verbose_name=_('name'), null=False)

    class Meta:
        name = 'product.attribute'


class AttributeValue(models.Model):
    name = models.CharField(verbose_name=_('name'), null=False)

    class Meta:
        name = 'product.attribute.value'


class Packaging(models.Model):
    name = models.CharField(verbose_name=_('name'), null=False)

    class Meta:
        name = 'product.packaging'
