import decimal
import datetime
import collections
import itertools
import sqlalchemy as sa
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import relationship

from orun.utils.datastructures import DictWrapper
from orun.conf import settings
from orun.core import exceptions
from orun.core import validators
from orun.utils.text import capfirst
from orun.utils.encoding import force_text, force_str
from orun.utils.functional import cached_property
from orun.utils.translation import gettext, gettext_lazy as _


class NOT_PROVIDED:
    pass


class Field(object):
    _db_type = sa.String(1024)

    empty_values = list(validators.EMPTY_VALUES)

    default_validators = []  # Default set of validators
    creation_counter = 0
    auto_creation_counter = -1
    max_length = None
    is_relation = None
    many_to_many = False
    rel_field = None
    set = None

    default_error_messages = {
        'invalid_choice': _('Value %(value)r is not a valid choice.'),
        'null': _('This field cannot be null.'),
        'required': _('This field cannot be blank.'),
        'unique': _('%(model_name)s with this %(field_label)s '
                    'already exists.'),
        # Translators: The 'lookup_type' is one of 'date', 'year' or 'month'.
        # Eg: "Title must be unique for pub_date year"
        'unique_for_date': _("%(field_label)s must be unique for "
                             "%(date_field_label)s %(lookup_type)s."),
    }

    related = None
    base_model = None
    local = None
    inherited = False
    child_field = False

    def __init__(self, label=None, db_column=None, db_index=False, primary_key=False,
                 concrete=None, readonly=None, null=True, required=None, widget_attrs=None,
                 auto_created=False, default=NOT_PROVIDED, choices=None,
                 deferred=False, copy=None, serializable=True, editable=True, help_text=None, validators=[],
                 error_messages=None, compute=None,
                 unique=False, db_tablespace=None, getter=None, setter=None, proxy=None, *args, **kwargs):
        self.column = None
        self.unique = unique
        self.name = None
        self.label = label or kwargs.get('verbose_name')
        self.db_column = db_column
        self.db_index = db_index
        if isinstance(proxy, str):
            proxy = proxy.split('.')
            if getter is None:
                getter = self.get_proxy_field_value
        self.proxy_field = proxy
        if concrete is None and getter:
            concrete = False
            if readonly is None:
                readonly = True
        if readonly is None:
            readonly = False
        elif concrete is None:
            concrete = True
        self.concrete = concrete
        self.readonly = readonly
        self.primary_key = primary_key
        if copy is None:
            self.copy = not self.primary_key and self.concrete and not auto_created
        self.default = default
        self.required = required
        self.null = null
        self.choices = choices
        self.attname = None
        self.deferred = deferred
        self.serializable = serializable
        self.editable = editable and serializable
        self.help_text = help_text
        self.db_tablespace = db_tablespace or settings.DEFAULT_INDEX_TABLESPACE
        self.depends = None
        self.getter = getter
        self.setter = setter
        self.compute = compute

        if null is None:
            self.null = True
        self.required = required
        if required is None:
            self.required = not self.null
        self.auto_created = auto_created
        self.widget_attrs = widget_attrs

        # Adjust the appropriate creation counter, and save our local copy.
        if auto_created:
            self.creation_counter = Field.auto_creation_counter
            Field.auto_creation_counter -= 1
        else:
            self.creation_counter = Field.creation_counter
            Field.creation_counter += 1

        self._validators = validators

        messages = {}
        for c in reversed(self.__class__.__mro__):
            messages.update(getattr(c, 'default_error_messages', {}))
        messages.update(error_messages or {})
        self.error_messages = messages

    def __str__(self):
        """ Return "app_label.model_label.field_name". """
        return '%s.%s' % (str(self.model._meta), self.name)

    def __repr__(self):
        """
        Displays the module, class and name of the field.
        """
        path = '%s.%s' % (self.__class__.__module__, self.__class__.__name__)
        name = getattr(self, 'name', None)
        if name is not None:
            return '<%s: %s>' % (path, name)
        return '<%s>' % path

    def contribute_to_class(self, cls, name):
        self.column = None
        self.set_attributes_from_name(name)
        self.model = cls
        if self.local is None:
            self.local = True
            self.inherited = False
        cls._meta.add_field(self)

        #if self.db_column:
        #    if not getattr(cls, self.attname, None):
        #        setattr(cls, self.attname, self)

        #if self.choices:
        #    setattr(cls, 'get_%s_display' % self.name, curry(cls._get_FIELD_display, field=self))

        # Initialize the primary key sqlalchemy column
        if self.primary_key and self.model._meta.app:
            self._prepare()
        if isinstance(self.getter, str):
            fn = getattr(cls, self.getter, None)
            self.depends = getattr(fn, 'depends', None)

    def create_column(self, bind=None, *args, **kwargs):
        if self.primary_key:
            kwargs['primary_key'] = self.primary_key
        if self.null is False:
            kwargs['nullable'] = False
        if self.default is not NOT_PROVIDED:
            kwargs['default'] = self.default
        if self.compute:
            kwargs['info'] = {'compute': self.compute}
            args += (FetchedValue(),)
        else:
            tp = self.db_type(bind=bind)
            if not isinstance(tp, tuple):
                tp = (tp,)
            args += tp
        return sa.Column(self.db_column, *args, **kwargs)

    def get_internal_type(self):
        return self.__class__.__name__

    def db_type(self, bind=None):
        return self._db_type

    def get_attname(self):
        return self.name

    def get_attname_column(self):
        attname = self.get_attname()
        column = self.db_column or attname
        return attname, column

    def get_proxy_field_value(self, instance):
        obj = instance
        for f in self.proxy_field:
            obj = getattr(obj, f)
        return obj

    @cached_property
    def info(self):
        return self._get_info()

    def _get_info(self):
        info = {
            'name': self.name,
            'help_text': self.help_text,
            'required': self.required,
            'readonly': self.readonly,
            'editable': self.editable,
            'type': self.get_internal_type(),
            'caption': capfirst(self.label),
            'choices': self.choices,
            'depends': self.depends,
            'attrs': self.widget_attrs,
        }
        if hasattr(self, 'max_length'):
            info['max_length'] = self.max_length
        return info

    def set_attributes_from_name(self, name):
        if not self.name:
            self.name = name
        if self.concrete is not False:
            self.attname, self.db_column = self.get_attname_column()
            self.concrete = self.db_column is not None
        if self.label is None and self.name:
            self.label = self.name.replace('_', ' ')

    def _prepare(self):
        if self.column is None and self.db_column:
            self.column = self.create_column()

    def __get__(self, instance, owner):
        if instance is None:
            return self
        getter = self.getter
        if isinstance(getter, str):
            v = getattr(instance, getter, None)
            if callable(v):
                return v()
            return v
        elif callable(getter):
            return getter(instance)

    def __set__(self, instance, value):
        setter = self.setter
        if isinstance(setter, str):
            setter = getattr(instance, setter, None)
        if callable(setter):
            setter(value)
        #instance._state.record[self] = value

    @cached_property
    def validators(self):
        """
        Some validators can't be created at field initialization time.
        This method provides a way to delay their creation until required.
        """
        return list(itertools.chain(self.default_validators, self._validators))

    def run_validators(self, value):
        if value in self.empty_values:
            return

        errors = []
        for v in self.validators:
            try:
                v(value)
            except exceptions.ValidationError as e:
                if hasattr(e, 'code') and e.code in self.error_messages:
                    e.message = self.error_messages[e.code]
                errors.extend(e.error_list)

        if errors:
            raise exceptions.ValidationError(errors)

    def validate(self, value, instance):
        """
        Validates value and throws ValidationError. Subclasses should override
        this to provide validation logic.
        """
        if not self.editable:
            # Skip validation for non-editable fields.
            return

        if self.choices and value not in self.empty_values:
            for option_key, option_value in self.choices:
                if isinstance(option_value, (list, tuple)):
                    # This is an optgroup, so look inside the group for
                    # options.
                    for optgroup_key, optgroup_value in option_value:
                        if value == optgroup_key:
                            return
                elif value == option_key:
                    return
            raise exceptions.ValidationError(
                self.error_messages['invalid_choice'],
                code='invalid_choice',
                params={'value': value},
            )

        # if value is None and not self.null:
        #     raise exceptions.ValidationError(self.error_messages['null'], code='null')

        if self.required and self.default is NOT_PROVIDED and value in self.empty_values:
            raise exceptions.ValidationError(self.error_messages['required'], code='required')

    def clean(self, value, instance):
        """
        Convert the value's type and run validation. Validation errors
        from to_python and validate are propagated. The correct value is
        returned if no error is raised.
        """
        self.validate(value, instance)
        self.run_validators(value)
        return value

    def clone(self):
        """
        Uses deconstruct() to clone a new copy of this Field.
        Will not preserve any class attachments/attribute names.
        """
        name, path, args, kwargs = self.deconstruct()
        return self.__class__(*args, **kwargs)

    def has_default(self):
        return False

    def deconstruct(self):
        """
        Returns enough information to recreate the field as a 4-tuple:

         * The name of the field on the model, if contribute_to_class has been run
         * The import path of the field, including the class: django.db.models.IntegerField
           This should be the most portable version, so less specific may be better.
         * A list of positional arguments
         * A dict of keyword arguments

        Note that the positional or keyword arguments must contain values of the
        following types (including inner values of collection types):

         * None, bool, str, unicode, int, long, float, complex, set, frozenset, list, tuple, dict
         * UUID
         * datetime.datetime (naive), datetime.date
         * top-level classes, top-level functions - will be referenced by their full import path
         * Storage instances - these have their own deconstruct() method

        This is because the values here must be serialized into a text format
        (possibly new Python code, possibly JSON) and these are the only types
        with encoding handlers defined.

        There's no need to return the exact way the field was instantiated this time,
        just ensure that the resulting field is the same - prefer keyword arguments
        over positional ones, and omit parameters with their default values.
        """
        # Short-form way of fetching all the default parameters
        keywords = {}
        possibles = {
            "primary_key": False,
            "max_length": None,
            "unique": False,
            "null": True,
            "db_index": False,
            #"default": NOT_PROVIDED,
            #"editable": True,
            #"serialize": True,
            #"unique_for_date": None,
            #"unique_for_month": None,
            #"unique_for_year": None,
            #"choices": [],
            #"help_text": '',
            "db_column": self.attname,
            "db_tablespace": settings.DEFAULT_INDEX_TABLESPACE,
        }
        attr_overrides = {
            #"unique": "_unique",
            #"error_messages": "_error_messages",
            #"validators": "_validators",
            #"verbose_name": "_verbose_name",
        }
        equals_comparison = {"db_tablespace"}
        for name, default in possibles.items():
            value = getattr(self, attr_overrides.get(name, name))
            # Unroll anything iterable for choices into a concrete list
            if name == "choices" and isinstance(value, collections.Iterable):
                value = list(value)
            # Do correct kind of comparison
            if name in equals_comparison:
                if value != default:
                    keywords[name] = value
            else:
                if value is not default:
                    keywords[name] = value

        if self.compute:
            keywords['compute'] = self.compute
        # Work out path - we shorten it for known Orun core fields
        path = "%s.%s" % (self.__class__.__module__, self.__class__.__name__)
        if path.startswith("orun.db.models.fields.related"):
            path = path.replace("orun.db.models.fields.related", "orun.db.models")
        if path.startswith("orun.db.models.fields.files"):
            path = path.replace("orun.db.models.fields.files", "orun.db.models")
        if path.startswith("orun.db.models.fields.proxy"):
            path = path.replace("orun.db.models.fields.proxy", "orun.db.models")
        if path.startswith("orun.db.models.fields.base"):
            path = path.replace("orun.db.models.fields.base", "orun.db.models")
        # Return basic info - other fields should override this.
        return (
            force_text(self.name, strings_only=True),
            path,
            [],
            keywords,
        )

    def to_python(self, value):
        """
        Converts a serialized value to a python compatible value.
        """
        if value == '':
            value = None
        return value

    def deserialize(self, value, instance):
        pass

    def serialize(self, value, instance):
        """
        Converts a python value to a serializable value.
        """
        return value

    def db_parameters(self, connection):
        """
        Extension of db_type(), providing a range of different return
        values (type, checks).
        This will look at db_type(), allowing custom model fields to override it.
        """
        self._prepare()
        db_type = self.db_type()
        if isinstance(db_type, tuple):
            db_type = db_type[0]
        type_string = db_type.compile(connection.dialect)
        check_string = self.db_check(connection)
        return {
            "type": type_string,
            "check": check_string,
        }

    def db_check(self, connection):
        """
        Return the database column check constraint for this field, for the
        provided connection. Works the same way as db_type() for the case that
        get_internal_type() does not map to a preexisting model field.
        """
        #data = DictWrapper(self.__dict__, connection.ops.quote_name, "qn_")
        try:
            #return connection.data_type_check_constraints[self.get_internal_type()] % data
            return None
        except KeyError:
            return None


class CharField(Field):

    def __init__(self, *args, **kwargs):
        self.translate = kwargs.pop('translate', False)
        max_length = kwargs.pop('max_length', 512)
        args = list(args)
        if args:
            arg = args.pop(0)
            if isinstance(arg, str):
                kwargs.setdefault('label', arg)
            elif isinstance(arg, int):
                max_length = arg
        super(CharField, self).__init__(*args, **kwargs)
        self.max_length = max_length

    def db_type(self, bind=None):
        return sa.String(self.max_length)

    def to_python(self, value):
        # Force serialized value to string
        if value is not None:
            value = str(value)
        return super(CharField, self).to_python(value)

    def serialize(self, value, instance):
        if value is None:
            value = ''
        if self.translate:
            value = gettext(value)
        else:
            value = str(value)
        return super(CharField, self).serialize(value, instance)


class IntegerField(Field):
    _db_type = sa.Integer()


class BigIntegerField(Field):
    _db_type = sa.BigInteger()


class FloatField(Field):
    _db_type = sa.Float()


class AutoField(Field):
    _db_type = sa.Integer()

    def __init__(self, *args, **kwargs):
        kwargs['required'] = False
        kwargs.setdefault('editable', False)
        super(AutoField, self).__init__(*args, **kwargs)

    def create_column(self, *args, **kwargs):
        return super(AutoField, self).create_column(autoincrement=True, *args, **kwargs)


class BigAutoField(AutoField):
    _db_type = sa.BigInteger().with_variant(sa.Integer, 'sqlite')


class TextField(Field):
    _db_type = sa.Text


class BooleanField(Field):
    _db_type = sa.Boolean(create_constraint=False)

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('default', False)
        super(BooleanField, self).__init__(*args, **kwargs)


class DateTimeField(Field):
    _db_type = sa.DateTime()

    def __init__(self, *args, **kwargs):
        auto_now_add = kwargs.pop('auto_now_add', None)
        if auto_now_add:
            kwargs.setdefault('default', datetime.datetime.now)
        super(DateTimeField, self).__init__(*args, **kwargs)


class DateField(DateTimeField):
    _db_type = sa.Date()

    def to_python(self, value):
        # Try the ISO format and then settings.DATE_INPUT_FORMATS
        for format in settings.DATE_INPUT_FORMATS:
            try:
                value = datetime.datetime.strptime(force_str(value), format).date()
                return super(DateField, self).to_python(value)
            except (ValueError, TypeError):
                continue


class TimeField(DateTimeField):
    _db_type = sa.Time()


class SmallIntegerField(Field):
    _db_type = sa.SmallInteger()


class PositiveIntegerField(IntegerField):
    pass


class PositiveSmallIntegerField(SmallIntegerField):
    pass


class DecimalField(Field):
    def __init__(self, digits=29, decimal_places=6, *args, **kwargs):
        self.digits = digits
        self.decimal_places = decimal_places
        super(DecimalField, self).__init__(*args, **kwargs)

    def db_type(self, bind=None):
        return sa.Numeric(self.digits, self.decimal_places)

    def to_python(self, value):
        if isinstance(value, (str, float)):
            value = decimal.Decimal(str(value))
        if value is not None:
            value = round(value, self.decimal_places)
        return super(DecimalField, self).to_python(value)


class EmailField(CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('max_length', 256)
        super(EmailField, self).__init__(*args, **kwargs)


class URLField(CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('max_length', 1024)
        super(URLField, self).__init__(*args, **kwargs)


class SelectionField(CharField):
    def __init__(self, *args, **kwargs):
        if args and isinstance(args[0], (list, tuple)):
            kwargs['choices'] = args[0]
        kwargs.setdefault('max_length', 32)
        super(SelectionField, self).__init__(*args[1:], **kwargs)


class PasswordField(CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('max_length', 128)
        super(PasswordField, self).__init__(*args, **kwargs)


class SlugField(CharField):
    pass


class BinaryField(Field):
    _db_type = sa.LargeBinary()

    def __init__(self, attachment=None, storage='db', *args, **kwargs):
        kwargs.setdefault('deferred', True)
        super(BinaryField, self).__init__(*args, **kwargs)
        self.attachment = attachment
        self.storage = storage


class FileField(BinaryField):
    pass


class ImageField(FileField):
    pass


class HtmlField(TextField):
    pass


class FilePathField(CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('max_length', 1024)
        super(FilePathField, self).__init__(*args, **kwargs)


class ImagePathField(FilePathField):
    pass


class field_property(object):
    def __init__(self, field_name, fget, fset=None):
        self.field_name = field_name
        self.fget = fget
        self.fset = fset

    def __get__(self, instance, owner):
        if instance:
            return self.fget(instance)
        meta = owner._meta
        return meta.fields_dict[self.field_name]

    def __set__(self, instance, value):
        self.fset(instance, value)
