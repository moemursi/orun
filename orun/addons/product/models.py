from orun.db import models
from orun.utils.translation import gettext_lazy as _


class ProductCategory(models.Model):
    name = models.CharField(64, null=False)
    parent = models.ForeignKey('self')

    class Meta:
        name = 'product.category'


class PriceList(models.Model):
    name = models.CharField(128, null=False)
    sequence = models.IntegerField()
    active = models.BooleanField(default=True, label=_('Active'))
    currency = models.ForeignKey('res.currency', label=_('Currency'), null=False)
    company = models.ForeignKey('res.company', label=_('Company'))
    country_groups = models.ManyToManyField('res.country.group')

    class Meta:
        name = 'product.price.list'


class UnitCategory(models.Model):
    name = models.CharField(64, null=False, label=_('Name'))

    class Meta:
        verbose_name = _('Unit Category')
        verbose_name_plural = _('Unit Categories')


class Unit(models.Model):
    name = models.CharField(64, null=False, label=_('Name'))
    active = models.BooleanField(default=True, label=_('Active'))
    category = models.ForeignKey(UnitCategory, null=False)
    factor = models.FloatField(default=1.0, null=False)
    rounding = models.FloatField(default=0.01, null=False)

    class Meta:
        name = 'product.uom'
        verbose_name = 'Unit of Measurement'
        verbose_name_plural = 'Units of Measurement'


class Template(models.Model):
    TYPE = (
        ('consumable', _('Consumable')),
        ('service', _('Service')),
        ('permanent', _('Permanent')),
        ('digital', _('Digital')),
    )
    name = models.CharField(128, label=_('Name'), null=False)
    active = models.BooleanField(default=True, label=_('Label'))
    color = models.IntegerField(label=_('Color Index'))
    sequence = models.IntegerField()
    description = models.TextField()
    description_purchase = models.TextField()
    description_sale = models.TextField()
    product_type = models.SelectionField(TYPE, label=_('Product Type'), default='consumable', null=False)
    can_rent = models.BooleanField(label=_('Can be rent'))
    category = models.ForeignKey(ProductCategory, null=False)
    sale_price = models.DecimalField()
    list_price = models.DecimalField()
    standard_price = models.DecimalField()
    volume = models.FloatField()
    weight = models.FloatField()
    warranty = models.DecimalField()
    can_purchase = models.BooleanField()
    price_list = models.ForeignKey('product.price.list')
    uom = models.ForeignKey(Unit, label=_('Unit of Measure'))
    uom_purchase = models.ForeignKey(Unit, label=_('Purchase Unit of Measure'))
    company = models.ForeignKey('res.company', label=_('Company'))
    default_code = models.CharField(128)

    class Meta:
        name = 'product.template'


class Item(models.Model):
    template = models.ForeignKey(Template, null=False)

    class Meta:
        name = 'product.item'


class Packaging(models.Model):
    name = models.CharField(64, label=_('Name'), null=False, unique=True)
    sequence = models.IntegerField()
    template = models.ForeignKey('product.template')
    qty = models.FloatField(label=_('Quantity per Package'))


class PriceListItem(models.Model):
    sequence = models.IntegerField()
    template = models.ForeignKey(Template, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE)
    min_qty = models.DecimalField()
    applied_on = models.SelectionField(
        (
            ('global', _('Global')),
            ('category', _('Category')),
            ('template', _('Product')),
            ('item', _('Variant')),
        )
    )
    based_on = models.SelectionField(
        (
            ('list-price', _('Public Price')),
            ('standard-price', _('Standard Price')),
            ('price-price', _('Other Price-List')),
        )
    )

    base_price_list = models.ForeignKey('self')
    company = models.ForeignKey('res.company')
    start_date = models.DateField(label=_('Start Date'))
    end_date = models.DateField(label=_('End Date'))
    compute_price = models.SelectionField(
        (
            ('$', _('Fixed Price ($)')),
            ('%', _('Percentage (%)')),
            ('formula', _('Formula'))
        ),
        default='$',
    )

    class Meta:
        name = 'product.price.list.item'


class SupplierInfo(models.Model):
    supplier = models.ForeignKey('res.partner', domain={'is_supplier': True}, on_delete=models.CASCADE)
    sequence = models.IntegerField()
    product_name = models.CharField(128)
    product_code = models.CharField(64)
    min_qty = models.FloatField()
    price = models.DecimalField()
    company = models.ForeignKey('res.company')
    currency = models.ForeignKey('res.currency')
    start_date = models.DateField(label=_('Start Date'))
    end_date = models.DateField(label=_('Start Date'))
    item = models.ForeignKey('product.item')
    template = models.ForeignKey('product.template')
    delay = models.IntegerField(label=_('Delay Lead Time'), default=1, null=False, help_text=_('Lead time in days'))

    class Meta:
        name = 'product.supplier.info'
        verbose_name = _('Information about a product vendor')
        verbose_name_plural = _('Information about a product vendor')
