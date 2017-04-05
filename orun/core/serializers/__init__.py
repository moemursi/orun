import importlib

from orun.conf import settings
from .base import SerializerDoesNotExist


# Built-in serializers
BUILTIN_SERIALIZERS = {
    "xml": "orun.core.serializers.xml_serializer",
    "txt": "orun.core.serializers.txt",
    "python": "orun.core.serializers.python",
    "json": "orun.core.serializers.json",
    #"yaml": "orun.core.serializers.pyyaml",
}

_serializers = {}


def register_serializer(format, serializer_module, serializers=None):
    """Register a new serializer.

    ``serializer_module`` should be the fully qualified module name
    for the serializer.

    If ``serializers`` is provided, the registration will be added
    to the provided dictionary.

    If ``serializers`` is not provided, the registration will be made
    directly into the global register of serializers. Adding serializers
    directly is not a thread-safe operation.
    """
    if serializers is None and not _serializers:
        _load_serializers()

    module = importlib.import_module(serializer_module)

    if serializers is None:
        _serializers[format] = module
    else:
        serializers[format] = module


def _load_serializers():
    """
    Register built-in and settings-defined serializers. This is done lazily so
    that user code has a chance to (e.g.) set up custom settings without
    needing to be careful of import order.
    """
    global _serializers
    serializers = {}
    for format in BUILTIN_SERIALIZERS:
        register_serializer(format, BUILTIN_SERIALIZERS[format], serializers)
    if hasattr(settings, "SERIALIZATION_MODULES"):
        for format in settings.SERIALIZATION_MODULES:
            register_serializer(format, settings.SERIALIZATION_MODULES[format], serializers)
    _serializers = serializers


def get_deserializer(format):
    if not _serializers:
        _load_serializers()
    if format not in _serializers:
        raise SerializerDoesNotExist(format)
    return _serializers[format].Deserializer


def deserialize(format, stream_or_string, **options):
    d = get_deserializer(format)
    return d(stream_or_string, **options).deserialize()
