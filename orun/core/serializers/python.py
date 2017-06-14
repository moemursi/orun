"""
A Python "serializer". Doesn't do much serializing per se -- just converts to
and from basic Python data types (lists, dicts, strings, etc.). Useful as a basis for
other serializers.
"""
from collections import OrderedDict
from sqlalchemy.orm import load_only

from orun import app
from orun.apps import apps
from orun.conf import settings
from orun.core.serializers import base
from orun.db import DEFAULT_DB_ALIAS, models, session
from orun.utils.encoding import force_text, is_protected_type


class Serializer(base.Serializer):
    """
    Serializes a QuerySet to basic Python objects.
    """

    internal_use_only = True

    def start_serialization(self):
        self._current = None
        self.objects = []

    def end_serialization(self):
        pass

    def start_object(self, obj):
        self._current = OrderedDict()

    def end_object(self, obj):
        self.objects.append(self.get_dump_object(obj))
        self._current = None

    def get_dump_object(self, obj):
        data = OrderedDict([('model', force_text(obj._meta))])
        if not self.use_natural_primary_keys or not hasattr(obj, 'natural_key'):
            data["pk"] = force_text(obj._get_pk_val(), strings_only=True)
        data['fields'] = self._current
        return data

    def handle_field(self, obj, field):
        value = field.value_from_object(obj)
        # Protected types (i.e., primitives like None, numbers, dates,
        # and Decimals) are passed through as is. All other values are
        # converted to string first.
        if is_protected_type(value):
            self._current[field.name] = value
        else:
            self._current[field.name] = field.value_to_string(obj)

    def handle_fk_field(self, obj, field):
        if self.use_natural_foreign_keys and hasattr(field.remote_field.model, 'natural_key'):
            related = getattr(obj, field.name)
            if related:
                value = related.natural_key()
            else:
                value = None
        else:
            value = getattr(obj, field.get_attname())
            if not is_protected_type(value):
                value = field.value_to_string(obj)
        self._current[field.name] = value

    def handle_m2m_field(self, obj, field):
        if field.remote_field.through._meta.auto_created:
            if self.use_natural_foreign_keys and hasattr(field.remote_field.model, 'natural_key'):
                def m2m_value(value):
                    return value.natural_key()
            else:
                def m2m_value(value):
                    return force_text(value._get_pk_val(), strings_only=True)
            self._current[field.name] = [
                m2m_value(related) for related in getattr(obj, field.name).iterator()
            ]

    def getvalue(self):
        return self.objects


def get_prep_value(model, field, value):
    if ':' in field:
        k, f = field.split(':')
        model_field = model._meta.fields_dict[k].related_model
        return k, model_field.objects.filter({f: value}).options(load_only(model_field.pk)).one().pk
    return field, value


def Deserializer(object_list, **options):
    """
    Deserialize simple Python objects back into Orun ORM instances.

    It's expected that you pass the Python objects themselves (instead of a
    stream or a string) to the constructor
    """
    db = options.pop('using', DEFAULT_DB_ALIAS)
    ignore = options.pop('ignorenonexistent', False)
    val_names_cache = {}
    model_name = options.get('model')
    Model = app[model_name]
    Object = app['sys.object']

    pk = xml_id = None

    for d in object_list:
        vals = d
        if xml_id or xml_id is None:
            vals = {}
            for k, v in d.items():
                # has a field identified
                field_name = k
                if ':' in k:
                    xml_id = True
                    if v not in val_names_cache:
                        field_name, f = k.split(':')
                        # the identified is a xml id
                        if f == 'id':
                            v = val_names_cache[v] = Object.get_object(v).object_id
                        else:
                            v = get_prep_value(Model, k, v)
                    else:
                        v = val_names_cache[v]
                vals[field_name] = v

            # Avoid to check by the xml id again
            xml_id = bool(xml_id)

        if pk is None:
            if 'pk' in vals:
                pk = Model._meta.pk
            else:
                pk = False

        # Ignore if pk is present and object already exists
        if not pk or (pk and session.query(pk.column).filter(pk.column == d['pk']).scalar() is None):
            try:
                obj = Model(**vals)
            except:
                print(obj)
            obj.save(force_insert=True)
            yield obj
        continue

        break
        data = {}
        if 'pk' in d:
            try:
                data[Model._meta.pk.attname] = Model._meta.pk.to_python(d.get('pk'))
            except Exception as e:
                raise base.DeserializationError.WithData(e, Model, d.get('pk'), None)
        m2m_data = {}

        if Model not in field_names_cache:
            field_names_cache[Model] = {f.name for f in Model._meta.get_fields()}
        field_names = field_names_cache[Model]

        # Handle each field
        for (field_name, field_value) in d["fields"].items():

            if ignore and field_name not in field_names:
                # skip fields no longer on model
                continue

            if isinstance(field_value, str):
                field_value = force_text(
                    field_value, options.get("encoding", settings.DEFAULT_CHARSET), strings_only=True
                )

            field = Model._meta.get_field(field_name)

            # Handle M2M relations
            if field.remote_field and isinstance(field.remote_field, models.ManyToManyRel):
                model = field.remote_field.model
                if hasattr(model._default_manager, 'get_by_natural_key'):
                    def m2m_convert(value):
                        if hasattr(value, '__iter__') and not isinstance(value, str):
                            return model._default_manager.db_manager(db).get_by_natural_key(*value).pk
                        else:
                            return force_text(model._meta.pk.to_python(value), strings_only=True)
                else:
                    def m2m_convert(v):
                        return force_text(model._meta.pk.to_python(v), strings_only=True)

                try:
                    m2m_data[field.name] = []
                    for pk in field_value:
                        m2m_data[field.name].append(m2m_convert(pk))
                except Exception as e:
                    raise base.DeserializationError.WithData(e, d['model'], d.get('pk'), pk)

            # Handle FK fields
            elif field.remote_field and isinstance(field.remote_field, models.ManyToOneRel):
                model = field.remote_field.model
                if field_value is not None:
                    try:
                        default_manager = model._default_manager
                        field_name = field.remote_field.field_name
                        if hasattr(default_manager, 'get_by_natural_key'):
                            if hasattr(field_value, '__iter__') and not isinstance(field_value, str):
                                obj = default_manager.db_manager(db).get_by_natural_key(*field_value)
                                value = getattr(obj, field.remote_field.field_name)
                                # If this is a natural foreign key to an object that
                                # has a FK/O2O as the foreign key, use the FK value
                                if model._meta.pk.remote_field:
                                    value = value.pk
                            else:
                                value = model._meta.get_field(field_name).to_python(field_value)
                            data[field.attname] = value
                        else:
                            data[field.attname] = model._meta.get_field(field_name).to_python(field_value)
                    except Exception as e:
                        raise base.DeserializationError.WithData(e, d['model'], d.get('pk'), field_value)
                else:
                    data[field.attname] = None

            # Handle all other fields
            else:
                try:
                    data[field.name] = field.to_python(field_value)
                except Exception as e:
                    raise base.DeserializationError.WithData(e, d['model'], d.get('pk'), field_value)

        obj = base.build_instance(Model, data, db)
        obj.save()
        sys_object = app['sys.object']
        if 'id' in d and d['id']:
            ref = sys_object.objects.create(
                name=d['id'],
                object_id=obj.pk,
                model=d['model'],
                app_label=options['app_label'],
            )
        yield obj
        #yield base.DeserializedObject(obj, m2m_data)


def _get_model(model_identifier):
    """
    Helper to look up a model from an "app_label.model_name" string.
    """
    try:
        return apps.get_model(model_identifier)
    except (LookupError, TypeError):
        raise base.DeserializationError("Invalid model identifier: '%s'" % model_identifier)
