"""
Serialize data to/from CSV
"""
import os
import csv

from orun.core.serializers.python import Deserializer as PythonDeserializer


def Deserializer(stream_or_string, app, **options):
    """
    Deserialize a stream or string of CSV data.
    """
    reader = csv.DictReader(stream_or_string, delimiter=';')
    row = reader.reader
    cols = reader.fieldnames
    model_name = os.path.basename(options['filename']).rsplit('.', 1)[0]
    # mandatory fields for csv deserializer
    for obj in PythonDeserializer(reader, app=app, model=model_name, fields=cols):
        pass
