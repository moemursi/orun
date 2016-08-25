"""
Serialize data to/from TXT
"""
import os

from orun.core.serializers.python import Deserializer as PythonDeserializer


def Deserializer(stream_or_string, **options):
    """
    Deserialize a stream or string of TXT data.
    """
    rows = stream_or_string.readlines()
    cols = [col.strip() for col in rows[0].strip().split('\t')]
    model_name = os.path.splitext(options['filename'])
    for obj in rows[1:]:
        obj = [val.strip() for val in obj.strip().split('\t')]
        fields = dict(zip(cols, obj))
        obj = PythonDeserializer({'model': model_name, 'fields': fields})
