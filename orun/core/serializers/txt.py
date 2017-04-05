"""
Serialize data to/from TXT
"""
import os
import csv

from orun.db import session
from orun.core.serializers import python


def Deserializer(stream_or_string, app, **options):
    """
    Deserialize a stream or string of TXT data.
    """
    if 'model' not in options:
        model_name = os.path.basename(options['filename']).rsplit('.', 1)[0]

    reader = csv.DictReader(stream_or_string, delimiter='\t')
    rows = reader.reader
    cols = reader.fieldnames
    # mandatory fields for txt deserializer
    if 'pk' in cols or 'id' in cols:
        for obj in python.Deserializer(reader, app=app, model=model_name, fields=cols):
            pass
