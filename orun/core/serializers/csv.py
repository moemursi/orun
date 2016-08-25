"""
Serialize data to/from CSV
"""
import os
import csv

from orun.core.serializers.python import Deserializer as PythonDeserializer


def Deserializer(stream_or_string, **options):
    """
    Deserialize a stream or string of JSON data.
    """
    rows = csv.reader(stream_or_string)
    cols = rows[0]
    model_name = os.path.splitext(options['filename'])
    for obj in rows[1:]:
        fields = dict(zip(cols, obj))
        obj = PythonDeserializer({'model': model_name, 'fields': fields})
