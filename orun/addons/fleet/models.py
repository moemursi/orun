import datetime
from orun.db import models
from orun.utils.translation import gettext_lazy as _


class Tag(models.Model):
    name = models.CharField(max_length=32, label=_('Name'))
    color = models.IntegerField()

    class Meta:
        name = 'fleet.tag'


class VehicleState(models.Model):
    name = models.CharField(max_length=32, label=_('Name'))
    color = models.IntegerField()

    class Meta:
        name = 'fleet.vehicle.state'


class VehicleMake(models.Model):
    name = models.CharField(64, label=_('Name'), null=False, unique=True)

    class Meta:
        name = 'fleet.vehicle.make'
        verbose_name = _('Make of Vehicle')


class VehicleModel(models.Model):
    TYPE = (
        ('general', _('General-Purpose Vehicle')),
        ('utility', _('Utility Vehicle')),
    )
    name = models.CharField(max_length=50, label=_('Name'), null=False)
    vehicle_make = models.ForeignKey(VehicleMake, label=_('Make of Vehicle'), null=False)
    model_type = models.CharField(16, label=_('Type'), choices=TYPE, default='general')
    image = models.BinaryField()

    class Meta:
        name = 'fleet.vehicle.model'
        verbose_name = _('Model of Vehicle')
        verbose_name_plural = _('Models of Vehicles')
        field_groups = {
            'searchable_fields': ['name', 'vehicle_make'],
            'groupable_fields': ['vehicle_make'],
            'list_fields': ['vehicle_make', 'name', 'model_type'],
        }

    def __str__(self):
        return '%s / %s' % (self.name, str(self.vehicle_make))


class Driver(models.Model):
    partner = models.ForeignKey('res.partner', label=_('Driver'), null=False)
    active = models.BooleanField(verbose_name=_('Active'), default=True, help_text='Indica se o condutor está ativo')
    start_date = models.DateField(_('Start Date'))
    end_date = models.DateField(_('End Date'))

    class Meta:
        name = 'fleet.driver'
        title_field = 'partner'
        verbose_name = _('Driver')
        verbose_name_plural = _('Drivers')

    def __str__(self):
        return str(self.partner)


class Category(models.Model):
    name = models.CharField(32, label=_('Name'), null=False)

    class Meta:
        name = 'fleet.vehicle.category'
        title_field = 'nome'


class Vehicle(models.Model):
    FUEL = (
        ('gasoline', _('Gasoline')),
        ('ethanol', _('Ethanol')),
        ('diesel', _('Diesel/Biodiesel')),
        ('gas', _('Gas')),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('other', 'Other')
    )
    OWNERSHIP = (
        ('own', _('Own')),
        ('outsourced', _('Outsourced')),
        ('provider', _('Service Provider')),
        ('rented', _('Rented')),
        ('leasing', _('Leasing'))
    )
    CARGO = (
        ('human', _('Human')),
        ('animal', _('Animal')),
        ('weight', _('Weight'))
    )
    DISTANCE_UNIT = (
        ('kilometer', _('Kilometer')),
        ('mile', _('Mile')),
    )
    company = models.ForeignKey('res.company', verbose_name=_('Company'))
    model = models.ForeignKey(VehicleModel, verbose_name=_('Model'), null=False, help_text='Modelo do veículo')
    model_year = models.SmallIntegerField(_('Model Year'), help_text='Ano do modelo')
    manufacture_year = models.SmallIntegerField(_('Manufacture Year'), null=False, help_text='Ano de fabricação')
    description = models.CharField(250, verbose_name=_('Description'), help_text='Descrição do modelo. Ex: 1.0, Branco')
    doors = models.SmallIntegerField(_('Doors Number'), help_text='Quantidade de portas', default=4)
    seats = models.SmallIntegerField(_('Seats Number'))
    vehicle_state = models.ForeignKey(VehicleState)
    co2 = models.FloatField(_('CO2 Emissions'))
    transmission = models.CharField(16, label=_('Transmission'), choices=(
        ('manual', _('Manual')),
        ('automatic', _('Automatic')),
    ))
    license_plate = models.CharField(20, verbose_name=_('License Plate'), help_text='Número da placa do veículo')
    color = models.CharField(max_length=20, verbose_name=_('Color'), help_text='Cor do equipamento')
    chassis = models.CharField(max_length=20, verbose_name=_('Chassis'), help_text='Número do Chassi do veículo')
    driver = models.ForeignKey(Driver, label=_('Driver'), help_text='Responsável principal pelo veículo')
    supplier = models.ForeignKey(
        'res.partner', verbose_name=_('Supplier'), help_text='Fornecedor responsável pelo venda ou locação do veículo'
    )
    active = models.BooleanField(_('Active'), null=False, default=True, help_text='Indica se o veículo está ativo')
    invoice_ref = models.CharField(20, verbose_name=_('Invoice Ref.'), help_text=_('Invoice reference number'))
    acquisition_date = models.DateField(_('Acquisition Date'), help_text='Data da compra/locação do equipamento')
    fuel = models.OneToManyField('fleet.vehicle.fuel', 'vehicle', verbose_name=_('Fuel'))
    ownership = models.CharField(max_length=16, verbose_name='Tipo', choices=OWNERSHIP, default='P', page='Detalhes')
    cargo = models.CharField(max_length=16, verbose_name=_('Cargo'), choices=CARGO, default='human')
    weight_capacity = models.DecimalField(label=_('Weight Capacity'), help_text='Capacidade de transporte')
    weight = models.DecimalField(label=_('Weight'), help_text=_('Vehicle weight'))
    weight_unit = models.CharField(16, label=_('Weight Unit'), choices=(
        ('ton', _('Ton')),
        ('lb', _('Pound')),
        ('kg', _('Kilogram')),
    ), default='ton')
    odometer = models.DecimalField(label=_('Odometer'), help_text='Horímetro atual do equipamento')
    odometer_unit = models.CharField(
        16, label=_('Odometer Unit'), choices=DISTANCE_UNIT, help_text='Horímetro atual do equipamento', default='kilometer'
    )
    hp = models.IntegerField(label=_('Horsepower'))
    lifespan_years = models.DecimalField(verbose_name=_('Lifespan (Years)'), help_text=_('Vehicle lifespan in years'))
    lifespan_hours = models.DecimalField(verbose_name=_('Lifespan (Hours)'), help_text=_('Vehicle lifespan in hours'))
    rented = models.BooleanField(_('Rented'), default=False, help_text=_('Vehicle is rented'))
    rent_value = models.DecimalField(_('Rent Value'), help_text='Valor de locação do veículo')
    category = models.ForeignKey(Category, verbose_name=_('Category'), help_text=_('Vehicle category'))
    autonomy = models.FloatField(label=_('Autonomy'))
    notes = models.TextField(verbose_name=_('Notes'))
    purchase_value = models.DecimalField(label=_('Purchase Value'))
    vehicle_costs = models.OneToManyField('fleet.vehicle.cost', 'vehicle', label=_('Costs'))

    class Meta:
        name = 'fleet.vehicle'
        verbose_name = _('Vehicle')
        verbose_name_plural = _('Vehicles')
        title_field = 'model'
        field_groups = {
            'list_fields': ['model', 'description'],
        }

    def __str__(self):
        if self.license_plate:
            return '%s - %s (%s/%s)' % (self.license_plate, str(self.model), self.manufacture_year, self.model_year)
        return '%s (%s/%s)' % (str(self.model), self.manufacture_year, self.model_year)


class VehicleFuel(models.Model):
    vehicle = models.ForeignKey(Vehicle, null=False, editable=False)
    fuel = models.CharField(16, choices=Vehicle.FUEL, label='Combustível')
    capacity = models.FloatField(label=_('Capacity'))
    autonomy = models.DecimalField(
        label=_('Autonomy'),
        help_text='Autonomia em quilometro por parte de combustível. (Ex: 10km por litro)'
    )

    class Meta:
        name = 'fleet.vehicle.fuel'
        verbose_name = 'Combustível'
        title_field = 'fuel'

    def __str__(self):
        return str(self.fuel)


class CostType(models.Model):
    name = models.CharField(64, null=False, unique=True)
    category = models.CharField(16, choices=(
        ('contract', _('Contract')),
        ('services', _('Service')),
        ('tax', _('Tax')),
        ('fee', _('Fee')),
    ))

    class Meta:
        name = 'fleet.cost.type'
        verbose_name = _('Cost Type')
        verbose_name_plural = _('Cost Type')


class VehicleCost(models.Model):
    vehicle = models.ForeignKey(Vehicle, label=_('Vehicle'), null=False)
    cost_type = models.ForeignKey(CostType, label=_('Cost Type'), null=False)
    value = models.DecimalField(label=_('Amount'))
    due_date = models.DateField(label=_('Due Date'))
    payment_date = models.DateField(label=_('Payment Date'))
    odometer = models.FloatField(label=_('Odometer'))
    contract = models.ForeignKey('fleet.contract', label=_('Contract'))

    class Meta:
        name = 'fleet.vehicle.cost'
        title_field = 'vehicle'


class Contract(VehicleCost):
    STATE = (
        ('open', _('In Progress')),
        ('to close', _('To Close')),
        ('closed', _('Terminated')),
    )
    TYPE = (
        ('freight', _('Freight')),
        ('rent', _('Rent')),
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
    description = models.CharField(label=_('Description'))
    contract_type = models.CharField(16, label=_('Contract Type'), choices=TYPE)
    cost_frequency = models.CharField(16, label=_('Charge Frequency'), choices=FREQUENCY)
    status = models.CharField(max_length=16, null=False, label=_('Status'), help_text='Situação/status atual do contrato')
    start_date = models.DateField(verbose_name=_('Start Date'), help_text='Data da saída', null=False, group='Saída')
    expiration_date = models.DateField(verbose_name=_('Expiration Date'), help_text='Data prevista para o retorno', group='Retorno')
    supplier = models.ForeignKey('res.partner', verbose_name=_('Supplier'), help_text='Parceiro contratado para o serviço de frete')
    destination = models.CharField(max_length=100, null=False, verbose_name='Destino', help_text='Destino do destino')
    notes = models.TextField(label=_('Terms and Conditions'))

    class Meta:
        name = 'fleet.contract'
        verbose_name = _('Freight Contract')
        verbose_name_plural = _('Freight Contract')
        title_field = 'description'


class FuelLog(VehicleCost):
    driver = models.ForeignKey(Driver, label=_('Driver'), help_text='Condutor responsável pelo abastecimento')
    date = models.DateTimeField(verbose_name=_('Date'), default=datetime.datetime.now, null=False)
    autonomy = models.DecimalField(label=_('Autonomy'), help_text='Contador final do ponto de abastecimento')
    invoice_ref = models.CharField(max_length=20, verbose_name='Documento', help_text='Número do documento comprobatório')
    fuel_log = models.OneToManyField('fleet.vehicle.fuel.log.item', 'fuel_log', verbose_name=_('Items'))

    class Meta:
        default_fields = ('vehicle', 'date')
        name = 'fleet.vehicle.fuel.log'
        verbose_name = _('Fuel Log')
        verbose_name_plural = _('Fuel Log')
        title_field = 'vehicle'

    def __str__(self):
        return '%s - %s' % (self.date, self.vehicle)


class FuelLogItem(models.Model):
    fuel_log = models.ForeignKey(FuelLog, null=False)
    item = models.CharField(16, label='Fuel', choices=Vehicle.FUEL, null=False)
    qty = models.DecimalField(_('Quantity'), help_text='Quantity fueled', null=False)
    unit = models.CharField(32)
    unit_price = models.DecimalField(verbose_name='Valor Litro', help_text='Valor por litro/metro de combustível')
    total = models.DecimalField(verbose_name='Total', help_text='Valor total abastecido')

    class Meta:
        name = 'fleet.vehicle.fuel.log.item'
        verbose_name = 'Combustível do Abastecimento'


class Route(models.Model):
    name = models.CharField(100, null=False, verbose_name=_('Name'), help_text='Descrição para a rota')
    origin = models.CharField(100, null=False, verbose_name='Origem', help_text='Origem da rota')
    destination = models.CharField(100, null=False, verbose_name='Destino', help_text='Destino da rota')
    distance = models.DecimalField(verbose_name=_('Distance'), help_text='Quilometro total de ida para a rota')
    avg_speed = models.DecimalField(verbose_name='Velocidade Média Ida', help_text='Velocidade média para ida')
    back_distance = models.DecimalField(verbose_name=_('Back Distance'), help_text='Quilometro total de volta para a rota')
    avg_speed_back = models.DecimalField(verbose_name='Velocidade Média Volta', help_text='Velocidade média para volta')
    total_distance = models.DecimalField(verbose_name=_('Total Distance'), help_text='Quilometragem total prevista para a rota')
    load_time = models.DecimalField(verbose_name='Tempo Carregamento', help_text='Total de tempo previsto para carregamento')
    unload_time = models.DecimalField(verbose_name='Tempo Descarregamento', help_text='Total de tempo previsto para descarregamento')
    avg_travel_time = models.DecimalField(verbose_name='Tempo Médio Ida', help_text='Tempo médio para ida')
    avg_back_time = models.DecimalField(verbose_name='Tempo Médio Volta', help_text='Tempo médio para volta')
    avg_wait_time = models.DecimalField(verbose_name='Tempo Espera', help_text='Tempo previsto de espero ao longo da rota')
    avg_total_time = models.DecimalField(verbose_name='Tempo Total', help_text='Total de tempo gasto na rota')
    notes = models.TextField(_('Notes'))

    class Meta:
        name = 'fleet.route'
        verbose_name = _('Route')
        verbose_name_plural = _('Routes')


class VehicleOdometer(models.Model):
    vehicle = models.ForeignKey(Vehicle, label=_('Vehicle'), null=False)
    driver = models.ForeignKey(Driver, label=_('Driver'), null=False)
    reason = models.CharField(200, label=_('Reason'), help_text=_('Travel reason'))
    start_date = models.DateField(label=_('Start Date'), null=False)
    current_odometer = models.DecimalField(label=_('Start Odometer'))
    elapsed_distance = models.DecimalField(label=_('Travelled Distance'), help_text=_('Total travelled distance'))
    end_date = models.DateField(label=_('End Date'), help_text=_('Estimated return date'))
    origin = models.CharField(100, null=False, label=_('Origin'), help_text='Origem da viagem')
    destination = models.CharField(100, null=False, label=_('Destination'))
    unit = models.CharField(16, choices=Vehicle.DISTANCE_UNIT)

    class Meta:
        name = 'fleet.vehicle.odometer'
        verbose_name = _('Odometer')
        verbose_name_plural = _('Odometer')
        field_groups = {
            'list_fields': ['start_date', 'vehicle', 'driver', 'origin', 'destination']
        }


class Maintenance(VehicleCost):
    TYPE = (
        ('corrective', _('Corrective')),
        ('planned', _('Planned')),
    )
    maintenance_type = models.CharField(16, label=_('Maintenance Type'), help_text='Tipo da manutenção', choices=TYPE, default='corrective', null=False)
    start_date = models.DateField(_('Start Date'), help_text='Data que entrou em manutenção')
    end_date = models.DateField(_('End Date'), help_text='Data que saiu da manutenção')
    description = models.TextField(label=_('Description'), help_text='Descrição completa da manutenção')
    responsible = models.ForeignKey('res.partner', label=_('Responsible'))
    supplier = models.ForeignKey('res.partner', label=_('Supplier'))
    assigned_employee = models.ForeignKey('res.partner', label=_('Assigned Employee'))
    supervisor_employee = models.ForeignKey('res.partner', label=_('Supervisor Employee'))
    notes = models.TextField(label=_('Notes'))

    class Meta:
        name = 'fleet.vehicle.maintenance'
        verbose_name = 'Maintenance'
        verbose_name_plural = 'Maintenances'
        title_field = 'vehicle'


class TrafficTicket(VehicleCost):
    reason = models.CharField(label=_('Reason'))
    date_time = models.DateTimeField(label=_('Date/Time'))
    kind = models.CharField(label=_('Kind'))
    driver = models.ForeignKey(Driver, label=_('Driver'))
    points = models.DecimalField(label=_('Points'))
    notes = models.TextField(label=_('Notes'))

    class Meta:
        name = 'fleet.traffic.ticket'
        verbose_name = _('Traffic Ticket')


class Allocation(models.Model):
    vehicle = models.ForeignKey(Vehicle, verbose_name=_('Vehicle'), null=False)
    responsible = models.ForeignKey('res.partner', label=_('Responsible Employee'))
    start_date = models.DateTimeField(_('Start Date'), help_text='Data inicial de alocação', null=False, default=datetime.datetime.now)
    end_date = models.DateTimeField(_('End Date'), help_text='Data final de alocação')

    class Meta:
        name = 'frota.alocacao'
