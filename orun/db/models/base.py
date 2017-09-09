import os
import datetime
import inspect
import copy
import collections
from sqlalchemy import orm, func
import sqlalchemy as sa

from orun.utils.xml import etree
from orun import api, render_template
from orun.db import session
from orun.db.models import signals
from orun.core.exceptions import ObjectDoesNotExist, ValidationError, PermissionDenied, NON_FIELD_ERRORS
from orun import app, env
from orun.apps import apps
from orun.utils.translation import gettext
from orun.utils.xml import get_xml_fields
from .options import Options
from .query import QuerySet, Insert, Update, Delete
from .fields import (
    Field, OneToOneField, CASCADE, ForeignKey, BooleanField, NOT_PROVIDED,
)


CHOICES_PAGE_LIMIT = 10


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
    @classmethod
    def __prepare__(cls, name, bases):
        return collections.OrderedDict()

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
                if not field.concrete and field.getter:
                    setattr(new_class, field.name, new_field)

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
                if opts.log_changes and not opts.extension and not parents:
                    from orun.db.models import ForeignKey, DateTimeField
                    _add_auto_field(opts, 'created_by', ForeignKey('auth.user', auto_created=True, editable=False, deferred=True))
                    _add_auto_field(opts, 'created_on', DateTimeField(default=datetime.datetime.now, auto_created=True, editable=False, deferred=True))
                    _add_auto_field(opts, 'updated_by', ForeignKey('auth.user', auto_created=True, editable=False, deferred=True))
                    _add_auto_field(opts, 'updated_on', DateTimeField(on_update=datetime.datetime.now, auto_created=True, editable=False, deferred=True))

                if not opts.extension and not parents:
                    from orun.db.models import CharField
                    disp_name = CharField(label=opts.verbose_name, auto_created=True, getter='__str__', editable=False)
                    new_class.add_to_class('display_name', disp_name)
                    setattr(new_class, 'display_name', disp_name)

            for base in parents:
                base = apps.all_models[base._meta.name]
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
                    if f.name not in opts._get_fields_dict():
                        new_field = copy.copy(f)
                        new_field.inherited = not base._meta.abstract
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

    def __subclasscheck__(cls, sub):
        if sub is not Model and sub._meta.parents:
            for parent in sub._meta.parents:
                return issubclass(cls, parent)
        return super(ModelBase, cls).__subclasscheck__(sub)

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
            return session.query(app[cls._meta.name])


class ModelState(object):
    def __init__(self, record=None):
        if record:
            self.record = record
            self.adding = False
        else:
            self.record = {}
            self.adding = True


class Model(metaclass=ModelBase):
    def __new__(cls, *args, **kwargs):
        new_obj = super(Model, cls).__new__(cls)
        return new_obj

    def __init__(self, *args, **kwargs):
        for k, v in kwargs.items():
            if v == '':
                v = None
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

    @api.method
    def create_name(cls, name, *args, **kwargs):
        context = kwargs.get('context')
        opts = cls._meta
        assert opts.title_field
        data = {opts.title_field: name}
        if context:
            for k, v in context.items():
                if k.startswith('default_'):
                    data[k[8:]] = v
        return cls.create(**data)._get_instance_label()

    @classmethod
    def check_permission(cls, operation, raise_exception=True):
        perm = app['auth.model.access'].has_permission(cls._meta.name, operation)
        if raise_exception and not perm:
            raise PermissionDenied(gettext('Permission denied!'))
        return True

    @classmethod
    def get_by_natural_key(cls, *args, **kwargs):
        raise NotImplementedError

    @api.method
    def load_views(self, views=None, **kwargs):
        if views is None and 'action' in kwargs:
            Action = app['sys.action.window']
            action = Action.objects.get(kwargs.get('action'))
            views = {mode: None for mode in action.view_mode.split(',')}
        elif views is None:
            views = {'form': None, 'list': None, 'search': None}

        return {
            mode: self.get_view_info(view_type=mode, view=v)
            for mode, v in views.items()
        }

    @classmethod
    def get_field_info(cls, field, view_type=None):
        return field.info

    @classmethod
    def get_fields_info(cls, view_id=None, view_type='form', toolbar=False, context=None, xml=None):
        opts = cls._meta
        if xml is not None:
            fields = get_xml_fields(xml)
            return {
                f.name: cls.get_field_info(f, view_type)
                for f in [opts.fields_dict.get(f.attrib['name']) for f in fields]
                if f
            }
        if view_type == 'search':
            searchable_fields = opts.searchable_fields
            if searchable_fields:
                return {f.name: cls.get_field_info(f, view_type) for f in searchable_fields}
            return {}
        else:
            r = {}
            for field in opts.fields:
                r[field.name] = cls.get_field_info(field, view_type)
            return r

    @classmethod
    def _get_default_view(cls, view_type):
        return render_template([
            'views/%s/%s.xml' % (cls._meta.name, view_type),
            'views/%s/%s.xml' % (cls._meta.app_config.schema, view_type),
            'views/%s.xml' % view_type,
        ], opts=cls._meta, _=gettext)

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

    @classmethod
    def get_view_info(cls, view_type, view=None):
        View = app['ui.view']
        model = app['sys.model']

        if view is None:
            view = list(View.objects.filter(mode='primary', view_type=view_type, model=model.get_by_natural_key(cls._meta.name).pk))
            if view:
               view = view[0]
        elif isinstance(view, (int, str)):
            view = View.objects.get(view)

        if view:
            xml_content = view.get_xml(model=cls)
            return {
                'content': etree.tostring(xml_content, encoding='utf-8').decode('utf-8'),
                'fields': cls.get_fields_info(view_type=view_type, xml=xml_content)
            }
        content = cls._get_default_view(view_type=view_type)
        return {
            'content': content,
            'fields': cls.get_fields_info(view_type=view_type, xml=content),
            #'view_actions': self.get_view_actions(view_type),
        }

    @api.method
    def get_defaults(self, context=None, *args, **kwargs):
        r = {}
        defaults = context or {}
        for f in self._meta.fields:
            if 'default_' + f.name in defaults:
                r[f.name] = defaults['default_' + f.name]
                continue
            if f.editable:
                if f.default is not NOT_PROVIDED:
                    if callable(f.default):
                        r[f.name] = f.default()
                    else:
                        r[f.name] = f.default
                elif isinstance(f, BooleanField):
                    r[f.name] = False
        return r or None

    def _deserialize_value(self, field, value):
        if value == '':
            value = None
        field.deserialize(value, self)

    @classmethod
    def deserialize(cls, instance, data):
        data.pop('id', None)
        children = {}
        for k, v in data.items():
            field = instance.__class__._meta.fields_dict[k]
            if field.child_field:
                children[field] = v
            else:
                instance._deserialize_value(field, v)

        instance.full_clean()
        if instance.pk:
            flds = data.keys() - [f.name for f in children]
            if flds:
                instance.save()
        else:
            instance.save()

        #post_data = cls.post_data.pop(id(instance), None)

        for k, v in children.items():
            instance._deserialize_value(k, v)

    def serialize(self, fields=None, exclude=None, view_type=None):
        opts = self._meta
        data = {}
        if fields:
            deferred_fields = []
        else:
            deferred_fields = opts.deferred_fields
        for f in opts.fields:
            if f in deferred_fields:
                continue
            if not f.serializable:
                continue
            if fields and f.name not in fields:
                continue
            if exclude and f.name in exclude:
                continue
            data[f.name] = f.serialize(getattr(self, f.name, None), instance=self)
        if 'id' not in data:
            data['id'] = self.pk
        return data

    def filter(self, *args, **kwargs):
        return self._search(*args, **kwargs)

    @api.method
    def search(cls, fields=None, count=None, page=None, limit=None, **kwargs):
        qs = cls._search(fields=fields, **kwargs)
        if count:
            count = qs.count()
        if page and limit:
            page = int(page)
            limit = int(limit)
            qs = qs[(page - 1) * limit:page * limit]
        return {
            'data': [obj.serialize(fields=fields) for obj in qs],
            'count': count,
        }

    def _get_instance_label(self):
        return (self.pk, str(self))

    @api.method
    def search_name(cls, name=None, count=None, page=None, label_from_instance=None, name_fields=None, *args, **kwargs):
        print('name fields', name_fields)
        params = kwargs.get('params')
        if name:
            if name_fields is None:
                name_fields = cls._meta.get_name_fields()
            q = [sa.or_(*[fld.column.ilike('%' + name + '%') for fld in name_fields])]
            if params:
                q.append(params)
            kwargs = {'params': q}
        qs = cls._search(*args, **kwargs)
        if count:
            count = qs.count()
        if page:
            page = int(page)
            qs = qs[(page - 1) * CHOICES_PAGE_LIMIT:page * CHOICES_PAGE_LIMIT]
        else:
            qs = qs[:CHOICES_PAGE_LIMIT]
        if isinstance(label_from_instance, list):
            label_from_instance = lambda obj, label_from_instance=label_from_instance: (obj.pk, ' - '.join([str(getattr(obj, f, '')) for f in label_from_instance if f in cls._meta.fields_dict]))
        if callable(label_from_instance):
            res = [label_from_instance(obj) for obj in qs]
        else:
            res = [obj._get_instance_label() for obj in qs]
        return {
            'count': count,
            'items': res,
        }

    @api.method
    def get_field_choices(cls, field, q=None, count=False, ids=None, page=None, **kwargs):
        field_name = field
        field = cls._meta.fields_dict[field_name]
        related_model = field.related_model
        search_params = {}
        if ids is None:
            search_params['name_fields'] = kwargs.get('name_fields', (field.name_fields is not None and [related_model._meta.fields_dict[f] for f in field.name_fields]) or None)
            search_params['name'] = q
            search_params['page'] = page
            search_params['count'] = count
            domain = kwargs.get('domain')
            if domain:
                search_params['params'] = domain
        else:
            search_params['params'] = [related_model.pk.in_(ids if isinstance(ids, (list, tuple)) else [ids])]
        label_from_instance = kwargs.get('label_from_instance', field.label_from_instance or kwargs.get('name_fields'))
        return related_model.search_name(label_from_instance=label_from_instance, **search_params)

    def clean_fields(self, exclude=None):
        """
        Clean all fields and raise a ValidationError containing a dict
        of all validation errors if any occur.
        """
        if exclude is None:
            exclude = []

        errors = {}
        for f in self._meta.fields:
            if f.name in exclude:
                continue

            if f.concrete:
                raw_value = getattr(self, f.attname or f.name, None)
                try:
                    f.clean(raw_value, self)
                except ValidationError as e:
                    errors[f.name] = e.error_list

        if errors:
            raise ValidationError(errors)

    def clean(self):
        """
        Hook for doing any extra model-wide validation after clean() has been
        called on every field by self.clean_fields. Any ValidationError raised
        by this method will not be associated with a particular field; it will
        have a special-case association with the field defined by NON_FIELD_ERRORS.
        """
        pass

    def full_clean(self, exclude=None, validate_unique=True):
        """
        Calls clean_fields, clean, and validate_unique, on the model,
        and raises a ``ValidationError`` for any errors that occurred.
        """
        errors = {}
        if exclude is None:
            exclude = []
        else:
            exclude = list(exclude)

        try:
            self.clean_fields(exclude=exclude)
        except ValidationError as e:
            errors = e.update_error_dict(errors)

        # Form.clean() is run even if other validation fails, so do the
        # same with Model.clean() for consistency.
        try:
            self.clean()
        except ValidationError as e:
            errors = e.update_error_dict(errors)

        # Run unique checks, but only for fields that passed validation.
        # TODO validate unique
        # if validate_unique:
        #     for name in errors.keys():
        #         if name != NON_FIELD_ERRORS and name not in exclude:
        #             exclude.append(name)
        #     try:
        #         self.validate_unique(exclude=exclude)
        #     except ValidationError as e:
        #         errors = e.update_error_dict(errors)

        if errors:
            raise ValidationError(errors)

    @api.method
    def write(cls, data):
        objs = []
        _cache_change = _cache_create = None
        for row in data:
            pk = row.pop('id', None)
            if pk:
                _cache_change = _cache_change or cls.check_permission('change')
                obj = cls.get(pk)
            else:
                _cache_create = _cache_create or cls.check_permission('create')
                obj = cls()
            cls.deserialize(obj, row)
            objs.append(obj.pk)
        return objs

    @api.method
    def destroy(cls, ids):
        cls.check_permission('delete')
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
        
    @api.method
    def copy(cls, id):
        obj = cls.get(id)
        new_item = {}
        fields = []
        for f in cls._meta.fields:
            if f.copy:
                fields.append(f.name)
                if cls._meta.title_field == f.name:
                    new_item[f.name] = gettext('%s (copy)') % obj[f.name]
                else:
                    new_item[f.name] = obj[f.name]
        fields.append('display_name')
        new_item = cls(**new_item)
        return new_item.serialize(fields=fields)

    @api.method
    def group_by(cls, grouping):
        field = cls._meta.fields_dict[grouping[0]]
        col = field.column
        if col.foreign_keys:
            qs = session.query(col.label('fk'), func.count(col).label('group_count')).group_by(col).subquery()
            qs = session.query(field.related_model, qs.c.group_count).outerjoin(qs, qs.c.fk == field.rel_field.column)
            for row in qs:
                yield {grouping[0]: row[0]._get_instance_label(), 'count': row[1]}
        else:
            for row in session.query(col, func.count(col)).group_by(col).all():
                yield row

    @classmethod
    def _search(cls, params=None, fields=None, domain=None, *args, **kwargs):
        cls.check_permission('read')
        qs = cls.objects
        if isinstance(params, dict):
            if isinstance(domain, dict):
                params.update(domain)
            qs = qs.filter(params)
        elif isinstance(params, (list, tuple)):
            qs = qs.filter(*params)
        if args:
            qs = qs.filter(*args)
        if fields:
            if 'display_name' in fields:
                fields.append(cls._meta.title_field)
            fields = [f.db_column for f in [cls._meta.fields_dict[f] for f in fields] if f.concrete]
            pk = cls.pk.name
            if pk not in fields:
                fields.append(pk)
            if fields:
                qs = qs.options(orm.load_only(*fields))
        return qs

    @api.method
    def auto_report(cls, *args, **kwargs):
        view = render_template([
            'reports/%s/auto_report.xml' % cls._meta.name,
            'reports/%s/auto_report.xml' % cls._meta.app_config.schema,
            'reports/auto_report.xml',
        ], opts=cls._meta, _=gettext)

        from orun.reports.engines import get_engine
        query = cls._search()
        engine = get_engine()
        rep = engine.auto_report(view, cls, query)
        out_file = '/web/reports/' + os.path.basename(rep.export())

        return {
            'open': out_file,
        }

    def __str__(self):
        if self._meta.title_field:
            return self[self._meta.title_field]
        return super(Model, self).__str__()

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

    #pk = property(_get_pk_val, _set_pk_val)
    #pk = field_property(_get_pk_val, _set_pk_val)

    def __setattr__(self, key, value):
        f = self._meta.fields_dict.get(key)
        if isinstance(f, ForeignKey) and not isinstance(value, Model):
            key = f.attname
        super(Model, self).__setattr__(key, value)

    def save(self, update_fields=None, force_insert=False):
        if not self.pk or force_insert:
            session.add(self)
        session.flush((self,))
