import base64
import datetime
import inspect
import copy
from itertools import chain
from sqlalchemy import orm
from sqlalchemy.ext.hybrid import hybrid_property

from orun import api, render_template
from orun.db import session
from orun.db.models import signals
from orun.core.exceptions import ObjectDoesNotExist, ValidationError
from orun import app, env
from orun.apps import apps
from .options import Options
from .query import QuerySet, Insert, Update, Delete
from .fields import (
    Field, OneToOneField, CASCADE, AutoField, ManyToManyField, ForeignKey, BooleanField, NOT_PROVIDED,
    field_property
)


class DO_NOTHING:
    pass


def create_meta(meta, attrs):
    attrs['__module__'] = None
    return type('Meta', tuple(meta), attrs)


def get_current_user():
    return env.user_id


def _add_auto_field(meta, name, field):
    if name not in meta._get_fields_dict():
        meta.model.add_to_class(name, field)


class ModelBase(type):
    """
    Metaclass for all models.
    """
    def __new__(cls, name, bases, attrs):
        super_new = super(ModelBase, cls).__new__

        # Also ensure initialization is only performed for subclasses of Model
        # (excluding Model class itself).
        parents = [b for b in bases if isinstance(b, ModelBase)]
        if not parents:
            return super_new(cls, name, bases, attrs)

        module = attrs.pop('__module__', None)
        app_label = module and module.split('.', 1)[0]
        model = attrs.pop('__model__', None)
        _app = attrs.pop('__app__', None)

        new_class = super_new(cls, name, bases, {'__module__': module})

        attr_meta = attrs.pop('Meta', None)
        meta_attrs = {}
        if attr_meta:
            meta_attrs = {k: v for k, v in attr_meta.__dict__.items() if not k.startswith('_')}
        _apps = meta_attrs.get('apps', apps)

        app_config = None
        if 'app_label' in meta_attrs:
            app_label = meta_attrs['app_label']
        if app_label:
            app_config = _apps.app_configs.get(module.split('.')[0])

        parents = [b for b in parents if hasattr(b, '_meta')]
        meta_parents = [b._meta.__class__ for b in parents]
        if not meta_parents:
            meta_parents = (Options,)

        if model:
            # Has original model
            opts = model._meta.__class__({}, app_config, parents)
            opts.app_label = model._meta.app_label
        else:
            # Create a new options _meta object
            opts = create_meta(meta_parents, meta_attrs)(meta_attrs, app_config, parents)

        if _app:
            opts.app = app

        new_class.add_to_class('_meta', opts)

        # Apply model inheritance
        extension = new_class._meta.extension

        if model:
            new_class._meta.parents = copy.copy(model._meta.parents)

            for field in model._meta.fields:
                new_field = copy.copy(field)
                new_class.add_to_class(new_field.name, new_field)

            for field in model._meta.private_fields:
                new_field = copy.copy(field)
                new_class._meta.add_field(field, private=True)
                new_field.model = new_class
                setattr(new_class, field.name, new_field)

            new_class.insert = Insert(new_class)
            new_class.update = Update(new_class)
            new_class.delete = Delete(new_class)

        else:
            if module != '__fake__':
                if not opts.extension and not parents:
                    from orun.db.models import CharField
                    disp_name = CharField(label=opts.verbose_name, auto_created=True, getter='__str__', editable=False)
                    new_class.add_to_class('display_name', disp_name)
                    setattr(new_class, 'display_name', disp_name)

                if opts.log_changes and not opts.extension and not parents:
                    from orun.db.models import ForeignKey, DateTimeField
                    _add_auto_field(opts, 'updated_on', DateTimeField(on_update=datetime.datetime.now, auto_created=True, editable=False))
                    _add_auto_field(opts, 'updated_by', ForeignKey('auth.user', auto_created=True, editable=False))
                    _add_auto_field(opts, 'created_on', DateTimeField(default=datetime.datetime.now, auto_created=True, editable=False))
                    _add_auto_field(opts, 'created_by', ForeignKey('auth.user', auto_created=True, editable=False))

            for base in parents:
                if not extension and not base._meta.abstract and module != '__fake__':
                    attr_name = '%s_ptr' % base._meta.model_name
                    new_field = OneToOneField(
                        base,
                        on_delete=CASCADE,
                        name=attr_name,
                        auto_created=True,
                        parent_link=True,
                        primary_key=True,
                        editable=False,
                        serializable=False,
                    )
                    new_class.add_to_class(attr_name, new_field)

                    new_class._meta.parents[base] = new_field

                # Clone base local fields to new class local fields
                for f in base._meta.fields:
                    new_field = copy.deepcopy(f)
                    new_field.inherited = True
                    new_field.local = (extension and f in base._meta.local_fields) or base._meta.abstract
                    new_field.base_model = base
                    new_class.add_to_class(new_field.name, new_field)

                if extension and base._meta.parents:
                    for base_parent, f in base._meta.parents.items():
                        new_class._meta.parents[base_parent] = new_class._meta.fields_dict[f.name]

            # Add all attributes to the class (replace inherited fields attributes)
            for obj_name, obj in attrs.items():
                new_class.add_to_class(obj_name, obj)
                if isinstance(obj, Field) and obj.primary_key:
                    new_class._meta.pk = obj

        new_class._prepare()

        if attrs.get('__register__', True):
            if _app:
                _app[new_class._meta.name] = new_class
            else:
                _apps.register_model(app_label, new_class)
        return new_class

    def add_to_class(cls, name, value):
        if not inspect.isclass(value) and hasattr(value, 'contribute_to_class'):
            value.contribute_to_class(cls, name)
        else:
            setattr(cls, name, value)

    def _prepare(cls):
        opts = cls._meta
        opts._prepare(cls)

        signals.class_prepared.send()

    # Add DML attributes
    @property
    def select(cls):
        if not cls._meta.app:
            cls = cls._meta.app[cls._meta.name]
        return QuerySet(cls)

    @property
    def env(cls):
        # Returns current environment context
        return env

    @property
    def objects(cls):
        if cls._meta.app:
            return session.query(cls)
        else:
            return session.query(cls._meta.app[cls._meta.name])

    def __subclasscheck__(cls, sub):
        print(cls, sub)
        if sub is not Model and sub._meta.parents:
            for parent in sub._meta.parents:
                return issubclass(cls, parent)
        return super(ModelBase, cls).__subclasscheck__(sub)



class ModelFieldComparator(object):
    def __get__(self, instance, owner):
        return owner._meta.table.c


class ModelState(object):
    def __init__(self, record=None):
        if record:
            self.record = record
            self.adding = False
        else:
            self.record = {}
            self.adding = True


CREATE_CHILDREN = 'CREATE'
UPDATE_CHILDREN = 'UPDATE'
DESTROY_CHILDREN = 'DESTROY'


class Model(metaclass=ModelBase):
    _cache = None

    def __new__(cls, *args, **kwargs):
        new_obj = super(Model, cls).__new__(cls)
        new_obj.__dict__['_cache'] = {}
        return new_obj

    def __init__(self, *args, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    #    self._state = ModelState(_record)
    #    if self._state.adding:
    #        self._state.record = self._meta.mapped(**kwargs)

    @classmethod
    def from_db(cls, record):
        new = cls(_record=record)
        #new._state.adding = False
        #new._state.db = db
        return new

    @classmethod
    def create(cls, **kwargs):
        obj = cls(**kwargs)
        obj.save()
        return obj

    @classmethod
    def get_by_natural_key(cls, *args, **kwargs):
        raise NotImplementedError

    @api.method
    def load_views(self, views=None):
        if views is None:
            views = ['form', 'list', 'search']
        return {v: self.get_view_info(v) for v in views}

    @classmethod
    def get_field_info(cls, field, view_type=None):
        return field.info

    @classmethod
    def get_fields_info(cls, view_id=None, view_type='form', toolbar=False, context=None):
        opts = cls._meta
        r = {}
        for field in cls._meta.fields:
            r[field.name] = cls.get_field_info(field, view_type)
        return r

    @classmethod
    def _get_default_view(cls, view_type):
        return render_template([
            'admin/%s/%s.html' % (cls._meta.name, view_type),
            'admin/%s/%s.html' % (cls._meta.app_config.schema, view_type),
            'admin/%s.html' % view_type,
        ], opts=cls._meta)

    @classmethod
    def _get_default_form_view(cls):
        return cls._get_default_view(view_type='form')

    @classmethod
    def _get_default_list_view(cls):
        pass

    @classmethod
    def _get_default_search_view(cls):
        pass

    @api.method
    def get(self, id):
        if id:
            return self._search().get(id)

    @api.method
    def get_view_info(self, view_type):
        return {
            'content': self._get_default_view(view_type),
            'fields': self.get_fields_info(view_type),
            #'view_actions': self.get_view_actions(view_type),
        }

    @api.method
    def get_defaults(self, *args, **kwargs):
        r = {}
        for f in self._meta.fields:
            if f.editable:
                if f.default is not NOT_PROVIDED:
                    if callable(f.default):
                        r[f.name] = f.default()
                    else:
                        r[f.name] = f.default
                elif isinstance(f, BooleanField):
                    r[f.name] = False
        return r or None

    def _save_children(self, field, value, parent_id):
        rel_model = field.related_model
        remote_field = field.remote_field.attname
        for v in value:
            obj = None
            vals = v.get('values')
            if v['action'] == DESTROY_CHILDREN:
                rel_model.objects.filter(pk=v['id'], **{remote_field: parent_id}).delete()
                continue
            elif v['action'] == CREATE_CHILDREN:
                obj = rel_model()
                vals[remote_field] = parent_id
            elif v['action'] == UPDATE_CHILDREN:
                obj = rel_model._default_manager.get(pk=v['values']['id'])
            self.deserialize(obj, v['values'])

    def _deserialize_value(self, field, value):
        field_name = field.name

        if isinstance(field, ManyToManyField):
            self.__m2m[field.name] = value
            return

        if value == '':
            value = None
        value = field.deserialize(value, self)

        setattr(self, field_name, value)

    @classmethod
    def deserialize(cls, instance, data):
        m2m = {}
        data.pop('id', None)
        file_fields = {}
        for k, v in data.items():
            field = instance.__class__._meta.get_field(k)
            instance._deserialize_value(field, v)

        # Processing File Fields
        for k, v in file_fields.items():
            cls._deserialize_value(instance, k, v)

        #instance.full_clean()
        if instance.pk:
            flds = data.keys() - m2m.keys()
            if flds:
                instance.save(update_fields=flds)
        else:
            instance.save()

        #post_data = cls.post_data.pop(id(instance), None)

        for k, v in m2m.items():
            getattr(instance, k).set(v)

        #if post_data:
        #    for f, v in post_data.items():
        #        cls._save_children(f, v, instance.pk)

    def serialize(self, fields=None, exclude=None, view_type=None):
        opts = self._meta
        data = {}
        if fields:
            deferred_fields = []
        else:
            deferred_fields = self._meta.deferred_fields
        for f in self._meta.fields:
            if f in deferred_fields:
                continue
            if not f.serializable:
                continue
            if fields and f.name not in fields:
                continue
            if exclude and f.name in exclude:
                continue
            data[f.name] = f.serialize(getattr(self, f.name, None))
        if 'id' not in data:
            data['id'] = self.pk
        return data

    def filter(self, *args, **kwargs):
        return self._search(*args, **kwargs)

    @api.method
    def search(cls, fields=None, *args, **kwargs):
        qs = cls._search(fields=fields, *args, **kwargs)
        return {
            'data': [obj.serialize(fields=fields) for obj in qs],
        }

    def _get_rec_name(self):
        return (self.pk, str(self))

    @api.method
    def search_name(cls, *args, **kwargs):
        qs = cls._search(*args, **kwargs)
        return [obj._get_rec_name() for obj in qs]

    @api.method
    def get_field_choices(cls, field, q=None):
        field_name = field
        field = cls._meta.fields_dict[field_name]
        related_model = field.related_model
        return related_model.search_name()

    @api.method
    def write(cls, data):
        objs = []
        for row in data:
            pk = row.pop('id', None)
            if pk:
                obj = cls.get(pk)
            else:
                obj = cls()
            cls.deserialize(obj, row)
            objs.append(obj.pk)
        return objs

    @api.method
    def destroy(cls, ids):
        ids = [v for v in cls._search((cls._meta.pk.column.in_(ids),), fields=[cls._meta.pk.name])]
        r = []
        for obj in ids:
            r.append(obj.pk)
            obj._destroy()
        if not ids:
            raise ObjectDoesNotExist()
        return {
            'ids': r,
        }

    def _destroy(self):
        session.delete(self)


    @classmethod
    def _search(cls, params=None, fields=None, *args, **kwargs):
        qs = cls.objects
        if isinstance(params, dict):
            qs = qs.filter(params)
        elif isinstance(params, (list, tuple)):
            qs = qs.filter(*params)
        if args:
            qs = qs.filter(*args)
        if fields:
            qs = qs.options(orm.load_only(*fields))
        return qs

    def __str__(self):
        if self._meta.title_field:
            return self[self._meta.title_field]
        super(Model, self).__str__()

    def __iter__(self):
        for f in self._meta.fields:
            # Check for serializable fields
            if f.serializable:
                yield f.name, f.serialize(self[f.name], self)

    def __getitem__(self, item):
        return getattr(self, item)

    def _get_pk_val(self, meta=None):
       if not meta:
           meta = self._meta
       return getattr(self, meta.pk.attname)

    def _set_pk_val(self, value):
       return setattr(self, self._meta.pk.attname, value)

    #pk = property(_get_pk_val, _set_pk_val)
    pk = field_property(_get_pk_val, _set_pk_val)

    def __setattr__(self, key, value):
        f = self._meta.fields_dict.get(key)
        if isinstance(f, ForeignKey) and not isinstance(value, Model):
            key = f.attname
        super(Model, self).__setattr__(key, value)

    def save(self, update_fields=None):
        if not self.pk:
            session.add(self)
        session.flush((self,))
        return
        if self._meta.parents:
            try:
                if self._cache:
                    self._save_parents(cls=self.__class__, update_fields=update_fields)
                    values = self._get_prep_values(self.__class__)
                    if values:
                        if self.pk:
                            self.update.values(values)
                        else:
                            r = self.insert.values(values)
                            self.__dict__[self._meta.pk.attname] = r.inserted_primary_key[0]
                        self._cache = {}
            except Exception as e:
                print(self._cache)
                raise
            session.expunge(self)
        else:
            session.flush((self,))
        self._cache = {}

    # def _get_prep_values(self, cls):
    #     values = {}
    #     for k, v in self._cache.items():
    #         f = cls._meta.fields_dict.get(k)
    #         if f:
    #             if f in cls._meta.local_fields:
    #                 values[f.attname] = v
    #         elif k in cls._meta.table.columns:
    #             values[k] = v
    #     return values

    # def _save_parents(self, cls, update_fields):
    #     meta = cls._meta
    #     for parent, field in meta.parents.items():
    #         parent = self._meta.app[parent._meta.name]
    #         self._save_parents(cls=parent, update_fields=update_fields)
    #         values = self._get_prep_values(parent)
    #         if values:
    #             if self._get_pk_val(parent._meta):
    #                 parent.update.where(parent._meta.pk.column == self._get_pk_val(parent._meta)).values(**values)
    #             else:
    #                 r = parent.insert.values(**values)
    #                 if field:
    #                     self._cache[field.attname] = r.inserted_primary_key[0]
