import sqlalchemy as sa
from sqlalchemy.orm import relationship, load_only

from orun import app
from orun.apps import apps
from orun.utils.functional import cached_property
from . import Field
from .mixins import FieldCacheMixin
from .reverse_related import (
    ManyToManyRel, )

__all__ = [
    'ForeignKey', 'OneToManyField', 'ManyToManyField', 'OneToOneField', 'CASCADE', 'SET_NULL',
    'RECURSIVE_RELATIONSHIP_CONSTANT'
]


CASCADE = 'CASCADE'
SET_NULL = 'SET NULL'
RECURSIVE_RELATIONSHIP_CONSTANT = 'self'


class RelatedField(FieldCacheMixin, Field):
    one_to_many = False
    one_to_one = False
    many_to_many = False
    many_to_one = False

    def __init__(self, related_name=None, lazy=None, to_fields=None, domain=None, *args, **kwargs):
        self.related_name = related_name
        self.lazy = lazy
        self.domain = domain
        self.to_fields = to_fields
        super(RelatedField, self).__init__(*args, **kwargs)

    #@cached_property
    @property
    def related_model(self):
        # Can't cache this property until all the models are loaded.
        #apps.check_models_ready()
        return self.rel_field.model

    def related(self):
        raise NotImplementedError

    def _get_info(self):
        info = super(RelatedField, self)._get_info()
        info['domain'] = self.domain
        return info

    def get_cache_name(self):
        return self.name


class ForeignKey(RelatedField):
    def __init__(self, to, related_name=None, to_field=None, db_constraint=True, parent_link=False,
                 on_delete=None, on_update=None, label_from_instance=None, name_fields=None,
                 *args, **kwargs):
        self.on_delete = on_delete
        self.on_update = on_update
        self.to = to
        self.db_constraint = db_constraint
        self.parent_link = parent_link
        self.label_from_instance = label_from_instance
        self.name_fields = name_fields
        kwargs.setdefault('db_index', False)
        super(ForeignKey, self).__init__(to_fields=[to_field], related_name=related_name, *args, **kwargs)

    @property
    def related_model(self):
        model = self.to
        if model == 'self':
            model = self.model
        if self.model._meta.app:
            if self.model.__module__ == '__fake__':
                if not isinstance(model, str):
                    print('model name', model, model._meta.name)
                    model = model._meta.name
                model = self.model._meta.apps.all_models.get(model, apps.all_models.get(model))
            if model is None or isinstance(model, str):
                model = self.model._meta.app.get_model(self.to)
        # is a migration
        if model and self.model.__module__ == '__fake__' and model._meta.extension:
            model = model._meta.base_model or model
        return model

    @property
    def rel_field(self):
        if self.to_fields and self.to_fields[0]:
            to_field = self.to_fields[0]
            if isinstance(to_field, str):
                return self.related_model._meta.fields_dict[to_field]
            return to_field
        model = self.related_model
        if not isinstance(model, str):
            return self.related_model._meta.pk

    def db_type(self, bind=None):
        rel_model = self.related_model

        if rel_model._meta.pk.column is None:
            rel_model._meta.pk._prepare()

        fk_name = rel_model._meta.table_name.replace('"', '') + '.' + rel_model._meta.pk.db_column
        if bind:
            return rel_model._meta.pk.column.type
        else:
            return rel_model._meta.pk.column.type, sa.ForeignKey(fk_name)

    def get_attname(self):
        return self.db_column or '%s_id' % self.name

    def _get_info(self):
        info = super(ForeignKey, self)._get_info()
        info['model'] = self.related_model._meta.name
        return info

    def deconstruct(self):
        name, path, args, kwargs = super(ForeignKey, self).deconstruct()
        #kwargs['on_delete'] = self.remote_field.on_delete
        #kwargs['from_fields'] = self.from_fields
        #kwargs['to_fields'] = self.to_fields

        #if self.remote_field.related_name is not None:
        #    kwargs['related_name'] = self.remote_field.related_name
        #if self.remote_field.related_query_name is not None:
        #    kwargs['related_query_name'] = self.remote_field.related_query_name
        #if self.remote_field.parent_link:
        #    kwargs['parent_link'] = self.remote_field.parent_link
        # Work out string form of "to"
        if isinstance(self.to, str):
            kwargs['to'] = self.to
        else:
            kwargs['to'] = self.to._meta.name

        # Handle the simpler arguments
        if self.db_constraint is not True:
           kwargs['db_constraint'] = self.db_constraint
        if self.on_delete is not None:
           kwargs['on_delete'] = self.on_delete
        # Rel needs more work.
        #to_meta = getattr(self.remote_field.model, "_meta", None)
        #if self.remote_field.field_name and (
        #            not to_meta or (to_meta.pk and self.remote_field.field_name != to_meta.pk.name)):
        #    kwargs['to_field'] = self.remote_field.field_name
        return name, path, args, kwargs

    def to_python(self, value):
        if isinstance(value, (list, tuple)):
            value = value[0]
        return super(ForeignKey, self).to_python(value)

    def set(self, value, instance):
        if isinstance(value, models.Model):
            getattr(instance.__class__, self.name).__set__(instance, value)
        else:
            getattr(instance.__class__, self.attname).__set__(instance, value)

    def serialize(self, value, instance=None):
        if value:
            return value._get_instance_label()


class OneToOneField(ForeignKey):
    many_to_many = False
    many_to_one = False
    one_to_many = False
    one_to_one = True

    def __init__(self, to, on_delete=None, *args, **kwargs):
        kwargs['unique'] = True
        if on_delete is None:
            on_delete = CASCADE
        super(OneToOneField, self).__init__(to, on_delete=on_delete, *args, **kwargs)

    def create_column(self, bind=None, *args, **kwargs):
        kwargs['autoincrement'] = False
        return super(OneToOneField, self).create_column(bind=bind, *args, **kwargs)


CREATE_CHILD = 'CREATE'
UPDATE_CHILD = 'UPDATE'
DESTROY_CHILD = 'DESTROY'


class OneToManyField(RelatedField):
    one_to_many = True
    child_field = True

    def __init__(self, to, to_field=None, lazy='dynamic', primary_join=None, cascade=None, *args, **kwargs):
        self.cascade = cascade
        self.to = to
        self.to_field = to_field
        self.primary_join = primary_join
        if isinstance(to, Field):
            self.to = to.model._meta.name
            self.to_field = to.name
        super(OneToManyField, self).__init__(lazy=lazy, *args, **kwargs)

    def get_attname(self):
        return None

    def _get_info(self):
        r = super(OneToManyField, self)._get_info()
        r['field'] = self.rel_field.name
        r['model'] = self.rel_field.model._meta.name
        return r

    @property
    def rel_field(self):
        if self.to_field is None:
            to = app.get_model(self.to)
            f = get_first_rel_field(to, self.model)
            assert f is not None, 'Unable to create OneToManyField "%s", no ForeignKey field found on "%s" for model "%s"' % (self.name, to._meta.name, self.model._meta.name)
            self.to_field = f.name
        return app.get_model(self.to)._meta.fields_dict[self.to_field]

    @cached_property
    def related(self):
        self.to = app.get_model(self.to)
        _app = app
        kwargs = {}
        if self.cascade is None:
            kwargs['passive_deletes'] = True
        if self.primary_join:
            return relationship(
                self.to,
                lazy=self.lazy,
                primaryjoin=self.primary_join(self.model, self.to), **kwargs
            )
        return relationship(app.get_model(self.to), foreign_keys=[self.rel_field.column], lazy=self.lazy, **kwargs)

    def serialize(self, value, instance=None):
        value = value.options(load_only('pk'))
        return [v.pk for v in value]

    def set(self, value, instance):
        if value:
            model = app[self.rel_field.model]
            pk = instance.pk
            for obj in value:
                # Set to create if no action defined
                if 'action' not in obj:
                    obj = {'action': CREATE_CHILD, 'values': obj}
                values = None
                act = obj['action']
                if act != DESTROY_CHILD:
                    values = obj['values']
                    values[self.rel_field.name] = pk
                if act == CREATE_CHILD:
                    item = model.write([values])
                elif act == UPDATE_CHILD:
                    item = model.write([values])
                elif act == DESTROY_CHILD:
                    model.destroy([obj['id']])


class ManyToManyField(RelatedField):
    many_to_many = True
    child_field = True

    rel_class = ManyToManyRel

    def __init__(self, to, through=None, through_fields=None, related_name=None, related_query_name=None,
                 limit_choices_to=None, symmetrical=None, db_constraint=None, db_table=None,
                 lazy='dynamic', *args, **kwargs):
        self.to = to
        self.through = through
        self.through_fields = through_fields
        self._rel_model = None
        self.through_model = None
        kwargs['rel'] = self.rel_class(
            self, to,
            related_name=related_name,
            related_query_name=related_query_name,
            limit_choices_to=limit_choices_to,
            symmetrical=symmetrical,
            through=through,
            through_fields=through_fields,
            db_constraint=db_constraint,
        )
        super(ManyToManyField, self).__init__(lazy=lazy, *args, **kwargs)

    def get_attname(self):
        return None

    @cached_property
    def related(self):
        from orun.db import models

        if self.to == 'self':
            rel_model = self.model
        #elif isinstance(self.to, models.Model):
        #    rel_model = app[self.to._meta.name]
        else:
            rel_model = app.get_model(self.to)

        self._rel_model = rel_model

        if isinstance(self.through, models.Model):
            try:
                new_model = app[self.through]
            except KeyError:
                self.through = None
        if self.through:
            new_model = app[self.through]
            if self.through_fields:
                from_field, to_field = self.through_fields
                from_field = new_model._meta.fields_dict[from_field].db_column
                self.rel_field = new_model._meta.fields_dict[to_field]
                to_field = self.rel_field.db_column
            else:
                from_field = get_first_rel_field(new_model, self.model).db_column
                self.rel_field = to_field = get_first_rel_field(new_model, rel_model)
                to_field = self.rel_field.db_column
        else:
            new_model, from_, to_ = self._build_model(rel_model)
            self.rel_field = new_model._meta.fields_dict[to_]
            from_field = from_ + '_id'
            to_field = to_ + '_id'
            self.through_fields = (from_, to_)
            self.through = new_model

        self.through_model = new_model

        return relationship(
            lambda: rel_model._meta.mapped,
            secondary=new_model._meta.table,
            #lazy=None,
            primaryjoin=self.model._meta.pk.column == new_model._meta.table.c[from_field],
            secondaryjoin=rel_model._meta.pk.column == new_model._meta.table.c[to_field],
        )

    @property
    def related_model(self):
        # Can't cache this property until all the models are loaded.
        #apps.check_models_ready()
        return self._rel_model

    @property
    def name_fields(self):
        return self.rel_field.name_fields


    @property
    def label_from_instance(self):
        return self.rel_field.label_from_instance

    def _build_model(self, rel_model):
        from orun.db import models

        from_ = 'from_%s' % self.model._meta.name.replace('.', '_')
        to_ = 'to_%s' % rel_model._meta.name.replace('.', '_')

        model_name = self.model._meta.name + '.' + self.name + '.rel'

        class Meta:
            name = model_name
            log_changes = False

        new_model = type('%s_%s' % (self.model.__name__, self.name), (models.Model,), {
            'Meta': Meta,
            '__module__': self.model._meta.app_label,
            # '__app__': self.model._meta.app,
            from_: ForeignKey(self.model, null=False),
            to_: ForeignKey(rel_model, null=False),
        })

        new_model._meta.auto_created = True
        new_model._meta.app = self.model._meta.app

        new_model._meta._build_table(self.model._meta.app.meta)
        new_model._meta._build_mapper()
        if new_model._meta.app:
            new_model._meta.app.models[model_name] = new_model
        return new_model, from_, to_

    def deconstruct(self):
        name, path, args, kwargs = super(ManyToManyField, self).deconstruct()

        if isinstance(self.to, str):
            kwargs['to'] = self.to
        else:
            kwargs['to'] = "%s.%s" % (
                self.to._meta.app_label,
                self.to._meta.object_name,
            )

        return name, path, args, kwargs

    def to_python(self, value):
        return self.related_model.objects.only('pk').filter(self.related_model.c.pk.in_(value)).all() if value else None

    def set(self, value, instance):
        # clear the current data before apply the new value
        v = getattr(instance, self.name)
        v.clear()
        if value:
            m = self.related_model
            value = m.objects.only('pk').filter(m.c.pk.in_([v[0] if isinstance(v, list) else v for v in value])).all()
            getattr(instance.__class__, self.name).__set__(instance, value)

    def serialize(self, value, instance=None):
        return [obj._get_instance_label() for obj in value]

    def _get_info(self):
        info = super(ManyToManyField, self)._get_info()
        info['model'] = self.related_model._meta.name
        return info


def get_first_rel_field(model, rel_model):
    for f in model._meta.fields:
        if isinstance(f, ForeignKey) and f.related_model._meta.name == rel_model._meta.name:
            return f


from orun.db import models