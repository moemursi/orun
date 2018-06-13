from collections import defaultdict

import sqlalchemy as sa
from sqlalchemy.orm import mapper, relationship, deferred, backref, synonym

from orun import app
from orun.db import connection, connections
from orun.utils.text import camel_case_to_spaces
from .fields import BigAutoField

DEFAULT_NAMES = ('unique_together', 'index_together', 'fixtures')


class Options(object):
    app = None
    app_config = None
    extension = None
    name = None
    log_changes = True
    ordering = None
    auto_created = None
    db_table = None
    db_tablespace = None
    table = None
    db_schema = None
    verbose_name = None
    verbose_name_plural = None
    base_model = None
    field_groups = None
    app_label = None
    title_field = None
    managed = True
    required_db_vendor = None
    unique_together = ()
    index_together = ()
    proxy = None
    fixtures = None
    virtual = False
    field_change_event = None

    def __init__(self, attrs, app_config=None, bases=None):
        if self.field_change_event is None:
            self.__class__.field_change_event = defaultdict(list)
        self.meta_attrs = attrs
        if 'abstract' not in attrs:
            self.abstract = False
        self.app_config = app_config
        self.fields = Fields(self)
        self.private_fields = []
        self.local_fields = []
        self.pk = None
        self.parents = {}
        self.mapped = None
        self.bases = bases
        if self.virtual:
            self.managed = False

    def __str__(self):
        return self.name or (self.model.app_label + '.' + self.object_name)

    def contribute_to_class(self, cls, name):
        opts = self.__class__
        cls._meta = self
        self.model = cls
        self.object_name = cls.__name__

        if opts.verbose_name is None:
            opts.verbose_name = camel_case_to_spaces(self.object_name)
        if opts.verbose_name_plural is None:
            opts.verbose_name_plural = camel_case_to_spaces(self.object_name + 's')

        # Get the app_label
        self.app_label = self.meta_attrs.get(
            'app_label', cls.__module__ and cls.__module__.split('.')[0]
        ) or self.app_label

        # Load main meta settings
        name = self.meta_attrs.get('name', None)
        db_table = self.meta_attrs.get('db_table', None)
        extension = self.meta_attrs.get('extension', None)

        # Calculate if model is an extension
        if not self.app:
            if extension is None:
                if name is None and self.bases:
                    for b in self.bases:
                        if not b._meta.abstract:
                            opts.base_model = b
                            opts.extension = True
                            break
                elif name:
                    opts.extension = False

            if name is None:
                if self.extension:
                    opts.name = self.bases[0]._meta.name
                else:
                    opts.name = self.app_label + '.' + self.object_name.lower()

            if db_table is None:
                if self.extension:
                    opts.db_table = self.bases[0]._meta.db_table
                elif not self.abstract and self.app_config:
                    opts.db_schema = opts.db_schema or self.app_config.db_schema
                    opts.db_table = self.name.replace('.', '_')
                    if opts.db_schema and opts.db_table.startswith(opts.db_schema + '_'):
                        opts.db_table = opts.db_table[len(opts.db_schema) + 1:]

    @property
    def table_name(self):
        if app and connection.backend.schema_allowed:
            if self.db_schema:
                return '"%s"."%s"' % (self.db_schema, self.db_table)
        if self.db_schema:
            return '%s_%s' % (self.db_schema, self.db_table)
        return self.db_table

    def add_field(self, field, private=False):
        if private:
            self.private_fields.append(field)
        else:
            #self.fields.insert(bisect(self.fields, field), field)
            # if field.creation_counter < 0 and field.local:
            #     self.fields.insert(0, field)
            # else:
            #     self.fields.append(field)
            self.fields.append(field)
            if field.local:
                if field.creation_counter < 0:
                    self.local_fields.insert(0, field)
                else:
                    self.local_fields.append(field)
            self.setup_pk(field)
            self._expire_cache()

    def setup_pk(self, field):
        if self.pk is None and field.primary_key:
            self.pk = field
            self.fields['pk'] = field

    @property
    def model_name(self):
        return self.object_name.lower()

    @property
    def schema(self):
        return self.app_config.schema

    @property
    def label_lower(self):
        return '%s.%s' % (self.schema, self.model_name)

    def _expire_cache(self):
        pass

    def _prepare(self, model):
        if self.app:
            if self.__class__.title_field is None and 'name' in self.fields_dict:
                self.__class__.title_field = 'name'
        else:
            if self.pk is None and not self.abstract:
                if self.parents:
                    pass
                else:
                    auto = BigAutoField('ID', primary_key=True, auto_created=True)
                    model.add_to_class('id', auto)

    def _build_table(self, meta):
        if self.pk:
            self.pk._prepare()

        if self.virtual or self.abstract or self.table is not None:
            return

        # Build the table
        args = []
        for f in self.concrete_fields:
            f._prepare()
            args.append(f.column)
        if self.app and connection.backend.schema_allowed:
            self.table = sa.Table(self.db_table.split('.')[-1], meta, *args, schema=self.db_schema)
        else:
            self.table = sa.Table(self.table_name, meta, *args)
        self.table.__model__ = self.model
        return self.table

    def _build_mapper(self):
        if self.virtual or self.abstract or self.mapped is not None:
            return

        # Build the orm mapper
        props = {}
        for f in self.local_fields:
            if f.name != f.db_column and f.column is not None and not f.column.foreign_keys:
                props[f.name] = f.column
            if not f.primary_key:
                if f.column is not None:
                    for fk in f.column.foreign_keys:
                        kwargs = {}
                        if f.lazy:
                            kwargs['lazy'] = f.lazy
                        if f.related_name and f.related_name != '+':
                            kwargs['backref'] = backref(f.related_name, lazy='dynamic')
                        kwargs['remote_side'] = fk.column
                        prop_name = f"_{f.name}__fk"
                        prop = props[prop_name] = relationship(
                            lambda fk=fk: fk.column.table.__model__._meta.mapped,
                            foreign_keys=[f.column],
                            **kwargs
                        )
                        props[f.name] = synonym(prop_name, descriptor=ForeignKeyDescriptor(prop_name, f, prop))
                    if f.deferred:
                        props[f.name] = deferred(f.column)
                elif f.related:
                    props[f.name] = f.related

        props['pk'] = synonym(self.pk.attname)

        table = self.table
        mapped = self.model

        additional_args = {}

        if self.parents:
            for parent, field in self.parents.items():
                parent = self.app.models[parent._meta.name]
                for f in self.fields:
                    if f.inherited:
                        f._prepare()

        if self.ordering:
            additional_args['order_by'] = normalize_ordering(self, self.ordering)
        elif not self.parents:
            additional_args['order_by'] = normalize_ordering(self, 'pk')

        if self.parents:
            for parent, field in self.parents.items():
                parent = self.app.models[parent._meta.name]
                if parent._meta.mapped is None:
                    parent._meta._build_mapper()
                col = self.fields_dict[field.name].column
                mapped.c = mapper(
                    mapped, table, inherits=parent, properties=props,
                    inherit_condition=col == list(col.foreign_keys)[0].column, **additional_args).c
        else:
            mapped.c = mapper(mapped, table, properties=props, **additional_args).c
            mapped.c.pk = self.pk.column

        self.mapped = mapped

    def _build_model(self, registry):
        from orun.db.models import Model
        name = self.name

        parents = self.bases
        bases = [self.model]
        model = self.model
        #for parent in parents:
        #    parent_class = registry[parent._meta.name]
        #    bases += parent_class._meta.bases
        #    model = type(self.object_name, (model, parent_class), {'__register__': False})

        #bases += [Model if base is Model else (base._meta.name in registry and registry[base._meta.name]) or base for base in model.mro() if issubclass(base, Model) and base is not model]
        bases += [Model if base is Model else (base._meta.name in registry and registry.models[base._meta.name]) or base for base in model._meta.bases if issubclass(base, Model) and base is not model]
        cls = type(self.object_name, tuple(bases), {'__app__': registry, '__model__': model, '__module__': self.app_label})
        return cls

    @property
    def concrete_fields(self):
        return [f for f in self.local_fields if f.concrete]

    @property
    def deferred_fields(self):
        return [f for f in self.fields if f.deferred]

    @property
    def fields_dict(self):
        return self.fields

    @property
    def editable_fields(self):
        return [f for f in self.fields if f.editable]

    @property
    def searchable_fields(self):
        if self.field_groups and 'searchable_fields' in self.field_groups:
            return [self.fields[field_name] for field_name in self.field_groups['searchable_fields']]
        elif self.title_field:
            return [self.get_title_field()]
        return []

    @property
    def grouping_fields(self):
        if self.field_groups and 'grouping_fields' in self.field_groups:
            return [self.fields[field_name] for field_name in self.field_groups['grouping_fields']]

    @property
    def list_fields(self):
        if self.field_groups and 'list_fields' in self.field_groups:
            return [self.fields[field_name] for field_name in self.field_groups['list_fields']]
        else:
            return self.editable_fields

    @property
    def form_fields(self):
        if self.field_groups and 'form_fields' in self.field_groups:
            return [self.fields[field_name] for field_name in self.field_groups['form_fields']]
        else:
            return self.editable_fields

    @property
    def auto_report_fields(self):
        if self.field_groups and 'auto_report' in self.field_groups:
            return [self.fields[field_name] for field_name in self.field_groups['auto_report']]
        else:
            return self.list_fields

    def __getitem__(self, item):
        return self.fields[item]

    def get_field(self, field):
        return self.fields[field]

    def can_migrate(self, connection):
        """
        Return True if the model can/should be migrated on the `connection`.
        `connection` can be either a real connection or a connection alias.
        """
        if not self.managed:
            return False
        if isinstance(connection, str):
            connection = connections[connection]
        if self.required_db_vendor:
            return self.required_db_vendor == connection.vendor
        # if self.required_db_features:
        #     return all(getattr(connection.features, feat, False)
        #                for feat in self.required_db_features)
        return True

    def get_title_field(self):
        return self.fields[self.title_field]

    def get_name_fields(self):
        if self.field_groups and 'name_fields' in self.field_groups:
            return [self.fields[field_name] for field_name in self.field_groups['name_fields']]
        return [self.fields[self.title_field]]


def normalize_together(option_together):
    """
    option_together can be either a tuple of tuples, or a single
    tuple of two strings. Normalize it to a tuple of tuples, so that
    calling code can uniformly expect that.
    """
    try:
        if not option_together:
            return ()
        if not isinstance(option_together, (tuple, list)):
            raise TypeError
        first_element = next(iter(option_together))
        if not isinstance(first_element, (tuple, list)):
            option_together = (option_together,)
        # Normalize everything to tuples
        return tuple(tuple(ot) for ot in option_together)
    except TypeError:
        # If the value of option_together isn't valid, return it
        # verbatim; this will be picked up by the check framework later.
        return option_together


def normalize_ordering(opts, ordering):
    if not isinstance(ordering, (list, tuple)):
        ordering = [ordering]
    r = []
    for o in ordering:
        desc = False
        if o[0] == '-':
            desc = True
            o = o[1:]
        if o == 'pk':
            o = opts.pk.column
        else:
            o = opts.fields_dict[o].column
        if desc:
            o = o.desc()
        r.append(o)
    return r


from orun.db.models.fields import Fields
from orun.db.models.fields.related_descriptors import ForeignKeyDescriptor
