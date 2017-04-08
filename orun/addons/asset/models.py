from orun.db import models
from orun.utils.translation import gettext_lazy as _

from product.models import Template


class Category(models.Model):
    name = models.CharField(128)

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')


class Item(models.Model):
    STATE = (
        ('new', _('New')),
        ('preserved', _('Preserved')),
        ('well-maintained', _('Well Maintained')),
        ('new-damaged', _('New Damaged')),
        ('poorly-maintained', _('Poorly Maintained')),
        ('uneconomical', _('Uneconomical')),
        ('recoverable', _('Recoverable')),
        ('irrecoverable', _('Irrecoverable')),
        ('discarded', _('Discarded')),
    )
    DISCARDED_REASON = (
        ('crashed', _('Crashed')),
        ('stolen', _('Stolen')),
        ('theft', _('Theft')),
        ('scrap', _('Scrap')),
    )
    code = models.CharField(64, db_index=True)
    template = models.ForeignKey('product.template')
    active = models.BooleanField(default=True)
    category = models.ForeignKey(Category)
    start_date = models.DateField(label=_('State Date'))
    manufacture_year = models.DateField()
    serial_number = models.CharField(64, label=_('Serial Number'))
    model = models.CharField(32, label=_('Model'))
    state = models.SelectionField(STATE, label=_('State'))
    state_date = models.DateField(label=_('State Date'))
    discarded_reason = models.SelectionField(DISCARDED_REASON)
    location = models.CharField(128)
    acquisition_amount = models.DecimalField(label=_('Acquisition Amount'))
    depreciation_value = models.DecimalField(label=_('Depreciation Value'))
    current_value = models.DecimalField(label=_('Current Value'))
    supplier = models.ForeignKey('res.partner')
    brand = models.ForeignKey('product.brand')
    guarantee_date = models.DateField()
    invoice_ref = models.CharField(64, label=_('Invoice Ref.'))
    item_costs = models.OneToManyField('asset.item.cost', 'item', label=_('Costs'))
    insurances = models.ManyToManyField('asset.insurance')
    notes = models.TextField(label=_('Notes'))

    class Meta:
        name = 'asset.item'


class CostType(models.Model):
    name = models.CharField(64, null=False, unique=True)
    category = models.SelectionField((
        ('contract', _('Contract')),
        ('services', _('Service')),
        ('tax', _('Tax')),
        ('fee', _('Fee')),
    ), label=_('Category'))

    class Meta:
        name = 'asset.cost.type'


class AssetCost(models.Model):
    asset = models.ForeignKey(Item, null=False)
    cost_type = models.ForeignKey(CostType, label=_('Cost Type'), null=False)
    value = models.DecimalField(label=_('Amount'))
    due_date = models.DateField(label=_('Due Date'))
    payment_date = models.DateField(label=_('Payment Date'))
    contract = models.ForeignKey('asset.contract', label=_('Contract'))

    class Meta:
        name = 'asset.item.cost'


class Contract(AssetCost):
    STATE = (
        ('open', _('In Progress')),
        ('to close', _('To Close')),
        ('closed', _('Terminated')),
    )
    TYPE = (
        ('insurance', _('Insurance')),
        ('leasing', _('Leasing')),
        ('maintenance', _('Maintenance')),
        ('other', _('Other')),
    )
    FREQUENCY = (
        ('no', _('No')),
        ('daily', _('Daily')),
        ('weekly', _('Weekly')),
        ('monthly', _('Monthly')),
        ('yearly', _('Yearly')),
    )
    contract_no = models.CharField(20, null=False, label='Número do Contrato', help_text='Número do contrato', copy=False)
    insurance = models.ForeignKey('asset.insurance')
    description = models.CharField(label=_('Description'))
    contract_type = models.SelectionField(TYPE, label=_('Contract Type'))
    cost_frequency = models.SelectionField(FREQUENCY, label=_('Charge Frequency'))
    status = models.CharField(max_length=16, null=False, label=_('Status'), help_text='Situação/status atual do contrato')
    start_date = models.DateField(verbose_name=_('Start Date'), help_text='Data da saída', null=False, group='Saída')
    expiration_date = models.DateField(verbose_name=_('Expiration Date'), help_text='Data prevista para o retorno', group='Retorno')
    supplier = models.ForeignKey('res.partner', verbose_name=_('Supplier'), help_text='Parceiro contratado para o serviço de frete')
    destination = models.CharField(max_length=100, null=False, verbose_name='Destino', help_text='Destino do destino')
    notes = models.TextField(label=_('Terms and Conditions'))

    class Meta:
        name = 'asset.contract'
        verbose_name = _('Contract')
        verbose_name_plural = _('Contracts')
        title_field = 'description'


class AssetMove(models.Model):
    item = models.ForeignKey('asset.item', null=False)
    origin = models.CharField(128)
    destination = models.CharField(128)
    date = models.DateField()
    reason = models.TextField(label=_('Reason'))

    class Meta:
        name = 'asset.item.move'
        verbose_name = _('Asset Move')
        verbose_name_plural = _('Asset Moves')


class Insurance(models.Model):
    supplier = models.ForeignKey('res.partner')
    broker = models.ForeignKey('res.partner')
    policy = models.CharField(32, label=_('Insurance Policy'))
    claim = models.CharField(64, label=_('Insurance Claim'))
    start_date = models.DateField(label=_('Start Date'))
    expiration_date = models.DateField(label=_('Expiration Date'))
    material_amount = models.DecimalField(label=_('Valor Material'))
    personal_amount = models.DecimalField(label=_('Valor Pessoal'))
    payment_date = models.DateField(label=_('Payment Date'))
    parcels = models.SmallIntegerField(label=_('Parcels'))
    parcel_amount = models.DecimalField(label=_('Parcel Amount'))
    total = models.DecimalField()
    notes = models.TextField(label=_('Notes'))

    class Meta:
        name = 'asset.insurance'


class AssetDepreciation(models.Model):
    item = models.ForeignKey('asset.item', null=False)
    amount = models.DecimalField(label=_('Amount'))
    old_value = models.DecimalField(label=_('Old Value'))
    new_value = models.DecimalField(label=_('New Value'))
    reason = models.TextField(label=_('Reason'))

    class Meta:
        name = 'asset.item.value'


class AssetState(models.Model):
    item = models.ForeignKey('asset.item', null=False)
    date = models.DateField()
    state = models.SelectionField(Item.STATE)

    class Meta:
        name = 'asset.item.state'


class Maintenance(AssetCost):
    STATUS = (
        ('fixing', _('Fixing')),
        ('restored', _('Restored')),
        ('impossible', _('Impossible Restoration')),
        ('with-damage', _('With Damage')),
    )
    contract = models.ForeignKey(Contract)
    start_date = models.DateField(label=_('Start Date'))
    deadline = models.DateField()
    end_date = models.DateField(label=_('End Date'))
    status = models.SelectionField(STATUS)
    amount = models.DecimalField(label=_('Amount'))
    guarantee_date = models.DateField(label=_('Guarantee Date'))

    class Meta:
        name = 'asset.item.maintenance'


class ProductTemplate(Template):
    asset_category = models.ForeignKey(Category, label=_('Asset Category'))
