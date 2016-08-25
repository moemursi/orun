from importlib import import_module
import builtins
import datetime
import decimal
import functools
import types
import collections
import enum

from orun.db import models
from orun.db.migrations.operations import Operation
from orun.utils.version import get_docs_version


class BaseSerializer(object):
    def __init__(self, value):
        self.value = value

    def serialize(self):
        raise NotImplemented()


class BaseSequenceSerializer(BaseSerializer):
    def _format(self):
        raise NotImplementedError('Subclasses of BaseSequenceSerializer must implement the _format() method.')

    def serialize(self):
        imports = set()
        strings = []
        for item in self.value:
            item_string, item_imports = serializer_factory(item).serialize()
            imports.update(item_imports)
            strings.append(item_string)
        value = self._format()
        return value % (", ".join(strings)), imports


class SequenceSerializer(BaseSequenceSerializer):
    def _format(self):
        return "[%s]"


class DeconstructableSerializer(BaseSerializer):
    @staticmethod
    def serialize_deconstructed(path, args, kwargs):
        name, imports = DeconstructableSerializer._serialize_path(path)
        strings = []
        for arg in args:
            arg_string, arg_imports = serializer_factory(arg).serialize()
            strings.append(arg_string)
            imports.update(arg_imports)
        for kw, arg in sorted(kwargs.items()):
            arg_string, arg_imports = serializer_factory(arg).serialize()
            imports.update(arg_imports)
            strings.append("%s=%s" % (kw, arg_string))
        return "%s(%s)" % (name, ", ".join(strings)), imports

    @staticmethod
    def _serialize_path(path):
        module, name = path.rsplit(".", 1)
        if module == "orun.db.models":
            imports = {"from orun.db import models"}
            name = "models.%s" % name
        else:
            imports = {"import %s" % module}
            name = path
        return name, imports

    def serialize(self):
        return self.serialize_deconstructed(*self.value.deconstruct())


class DictionarySerializer(BaseSerializer):
    def serialize(self):
        imports = set()
        strings = []
        for k, v in sorted(self.value.items()):
            k_string, k_imports = serializer_factory(k).serialize()
            v_string, v_imports = serializer_factory(v).serialize()
            imports.update(k_imports)
            imports.update(v_imports)
            strings.append((k_string, v_string))
        return "{%s}" % (", ".join("%s: %s" % (k, v) for k, v in strings)), imports


class EnumSerializer(BaseSerializer):
    def serialize(self):
        enum_class = self.value.__class__
        module = enum_class.__module__
        imports = {"import %s" % module}
        v_string, v_imports = serializer_factory(self.value.value).serialize()
        imports.update(v_imports)
        return "%s.%s(%s)" % (module, enum_class.__name__, v_string), imports


class ModelFieldSerializer(DeconstructableSerializer):
    def serialize(self):
        attr_name, path, args, kwargs = self.value.deconstruct()
        return self.serialize_deconstructed(path, args, kwargs)


class OperationSerializer(BaseSerializer):
    def serialize(self):
        from orun.db.migrations.writer import OperationWriter
        string, imports = OperationWriter(self.value, indentation=0).serialize()
        # Nested operation, trailing comma is handled in upper OperationWriter._write()
        return string.rstrip(','), imports


class TupleSerializer(BaseSequenceSerializer):
    def _format(self):
        # When len(value)==0, the empty tuple should be serialized as "()",
        # not "(,)" because (,) is invalid Python syntax.
        return "(%s)" if len(self.value) != 1 else "(%s,)"


class TextTypeSerializer(BaseSerializer):
    def serialize(self):
        value_repr = repr(self.value)
        return value_repr, set()


class BaseSimpleSerializer(BaseSerializer):
    def serialize(self):
        return repr(self.value), set()


class FunctionTypeSerializer(BaseSerializer):
    def serialize(self):
        if getattr(self.value, "__self__", None) and isinstance(self.value.__self__, type):
            klass = self.value.__self__
            module = klass.__module__
            return "%s.%s.%s" % (module, klass.__name__, self.value.__name__), {"import %s" % module}
        # Further error checking
        if self.value.__name__ == '<lambda>':
            raise ValueError("Cannot serialize function: lambda")
        if self.value.__module__ is None:
            raise ValueError("Cannot serialize function %r: No module" % self.value)
        # Python 3 is a lot easier, and only uses this branch if it's not local.
        if getattr(self.value, "__qualname__", None) and getattr(self.value, "__module__", None):
            if "<" not in self.value.__qualname__:  # Qualname can include <locals>
                return "%s.%s" % \
                    (self.value.__module__, self.value.__qualname__), {"import %s" % self.value.__module__}
        # Python 2/fallback version
        module_name = self.value.__module__
        # Make sure it's actually there and not an unbound method
        module = import_module(module_name)
        return "%s.%s" % (module_name, self.value.__name__), {"import %s" % module_name}


class IterableSerializer(BaseSerializer):
    def serialize(self):
        imports = set()
        strings = []
        for item in self.value:
            item_string, item_imports = serializer_factory(item).serialize()
            imports.update(item_imports)
            strings.append(item_string)
        # When len(strings)==0, the empty iterable should be serialized as
        # "()", not "(,)" because (,) is invalid Python syntax.
        value = "(%s)" if len(strings) != 1 else "(%s,)"
        return value % (", ".join(strings)), imports


class TypeSerializer(BaseSerializer):
    def serialize(self):
        special_cases = [
            (models.Model, "models.Model", []),
        ]
        for case, string, imports in special_cases:
            if case is self.value:
                return string, set(imports)
        if hasattr(self.value, "__module__"):
            module = self.value.__module__
            if module == builtins.__name__:
                return self.value.__name__, set()
            else:
                return "%s.%s" % (module, self.value.__name__), {"import %s" % module}


def serializer_factory(value):
    if isinstance(value, models.Field):
        return ModelFieldSerializer(value)
    if isinstance(value, Operation):
        return OperationSerializer(value)
    if isinstance(value, type):
        return TypeSerializer(value)
    # Anything that knows how to deconstruct itself.
    if hasattr(value, 'deconstruct'):
        return DeconstructableSerializer(value)

    # Unfortunately some of these are order-dependent.
    if isinstance(value, frozenset):
        return FrozensetSerializer(value)
    if isinstance(value, list):
        return SequenceSerializer(value)
    if isinstance(value, set):
        return SetSerializer(value)
    if isinstance(value, tuple):
        return TupleSerializer(value)
    if enum and isinstance(value, enum.Enum):
        return EnumSerializer(value)
    if isinstance(value, dict):
        return DictionarySerializer(value)
    if isinstance(value, datetime.datetime):
        return DatetimeSerializer(value)
    if isinstance(value, datetime.date):
        return DateSerializer(value)
    if isinstance(value, datetime.time):
        return TimeSerializer(value)
    if isinstance(value, datetime.timedelta):
        return TimedeltaSerializer(value)
    if isinstance(value, float):
        return FloatSerializer(value)
    if isinstance(value, (int, bool, type(None))):
        return BaseSimpleSerializer(value)
    if isinstance(value, bytes):
        return ByteTypeSerializer(value)
    if isinstance(value, str):
        return TextTypeSerializer(value)
    if isinstance(value, decimal.Decimal):
        return DecimalSerializer(value)
    if isinstance(value, functools.partial):
        return FunctoolsPartialSerializer(value)
    if isinstance(value, (types.FunctionType, types.BuiltinFunctionType)):
        return FunctionTypeSerializer(value)
    if isinstance(value, collections.Iterable):
        return IterableSerializer(value)
    raise ValueError("Cannot serialize")
