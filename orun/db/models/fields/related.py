import sqlalchemy as sa
from sqlalchemy.orm import relationship

from orun import app
from orun.apps import apps
from orun.utils.functional import cached_property
from .base import Field


__all__ = ['ForeignKey', 'OneToManyField', 'ManyToManyField', 'OneToOneField', 'CASCADE', 'SET_NULL']


class CASCADE:
    pass


class SET_NULL:
    pass


class RelatedField(Field):
    one_to_many = False
    one_to_one = False
    many_to_many = False
    many_to_one = False

    def __init__(self, related_name=None, lazy=None, to_fields=None, *args, **kwargs):
        self.related_name = related_name
        self.lazy = lazy
        self.to_fields = to_fields
        super(RelatedField, self).__init__(*args, **kwargs)

    #@cached_property
    @property
    def related_model(self):
        # Can't cache this property until all the models are loaded.
        #apps.check_models_ready()
        return self.remote_field.model

    def related(self):
        raise NotImplementedError


class ForeignKey(RelatedField):
    def __init__(self, to, related_name=None, domain=None, to_field=None, db_constraint=True, parent_link=False,
                 *args, **kwargs):
        self.to = to
        self.db_constraint = db_constraint
        self.parent_link = parent_link
        kwargs.setdefault('db_index', True)
        super(ForeignKey, self).__init__(to_fields=[to_field], related_name=related_name, *args, **kwargs)

    @property
    def related_model(self):
        model = self.to
        if model == 'self':
            model = self.model
        if self.model._meta.app:
            model = self.model._meta.app[model]
        # is a migration
        if model and self.model.__module__ == '__fake__' and model._meta.extension:
            model = model._meta.base_model
        return model

    @property
    def remote_field(self):
        if self.to_fields and self.to_fields[0]:
            to_field = self.to_fields[0]
            if isinstance(to_field, str):
                return self.related_model._meta.fields_dict[to_field]
            return to_field
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
        return '%s_id' % self.name

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
        if self.db_index:
            del kwargs['db_index']
        else:
            kwargs['db_index'] = False
        #if self.db_constraint is not True:
        #    kwargs['db_constraint'] = self.db_constraint
        # Rel needs more work.
        #to_meta = getattr(self.remote_field.model, "_meta", None)
        #if self.remote_field.field_name and (
        #            not to_meta or (to_meta.pk and self.remote_field.field_name != to_meta.pk.name)):
        #    kwargs['to_field'] = self.remote_field.field_name
        return name, path, args, kwargs

    def deserialize(self, value, instance=None):
        if isinstance(value, (list, tuple)):
            return value[0]
        return value

    def serialize(self, value, instance=None):
        if value:
            return value._get_rec_name()


class OneToManyField(RelatedField):
    one_to_many = True

    def __init__(self, to, to_field=None, lazy='dynamic', *args, **kwargs):
        self.to = to
        self.to_field = to_field
        if isinstance(to, Field):
            self.to = to.model._meta.name
            self.to_field = to.name
        super(OneToManyField, self).__init__(lazy=lazy, *args, **kwargs)

    def get_attname(self):
        return None

    @property
    def remote_field(self):
        return self.to._meta.fields_dict[self.to_field]

    @property
    def related(self):
        self.to = app[self.to]
        return relationship(lambda: self.to, foreign_keys=[self.remote_field.column], lazy=self.lazy)


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
        return super(OneToOneField, self).create_column(*args, **kwargs)


class ManyToManyField(RelatedField):
    many_to_many = True

    def __init__(self, to, through=None, lazy='dynamic', *args, **kwargs):
        self.to = to
        self.through = through
        super(ManyToManyField, self).__init__(lazy=lazy, *args, **kwargs)

    def get_attname(self):
        return None

    @cached_property
    def related(self):
        from orun.db import models

        if self.to == 'self':
            rel_model = self.model
        elif isinstance(self.to, models.Model):
            rel_model = app[self.to._meta.name]
        else:
            rel_model = app[self.to]

        from_ = 'from_%s' % self.model._meta.name.replace('.', '_')
        to_ = 'to_%s' % rel_model._meta.name.replace('.', '_')

        new_model = type('%s_%s' % (self.model.__name__, self.name), (models.Model,), {
            '__module__': self.model._meta.app_label,
            # '__app__': self.model._meta.app,
            from_: ForeignKey(self.model, null=False),
            to_: ForeignKey(rel_model, null=False),
        })

        new_model._meta.app = self.model._meta.app

        new_model._meta._build_table(self.model._meta.app.meta)
        new_model._meta._build_mapper()

        return relationship(
            lambda: rel_model._meta.mapped,
            secondary=new_model._meta.table,
            lazy=None,
            primaryjoin=self.model._meta.pk.column == new_model._meta.table.c[from_ + '_id'],
            secondaryjoin=rel_model._meta.pk.column == new_model._meta.table.c[to_ + '_id'],
        )

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
