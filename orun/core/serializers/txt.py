"""
Serialize data to/from TXT
"""
from orun.core.serializers import python


def Deserializer(stream_or_string, app, **options):
    """
    Deserialize a stream or string of TXT data.
    """
    rows = stream_or_string.readlines()
    cols = [col.strip() for col in rows[0].strip().split('\t')]
    model_name = options['model']
    for obj in python.Deserializer(
        [
            dict(zip(cols, [val.strip() for val in obj.strip().split('\t')]))
            for obj in rows[1:]
        ],
        app=app, model=model_name, fields=cols,
    ):
        obj.save(force_insert=True)
