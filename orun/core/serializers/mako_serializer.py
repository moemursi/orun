"""
Execute mako template before deserialize.
"""
import os
import tempfile
import mako.template

from orun.core.management.commands import loaddata
from orun.core.serializers import get_deserializer


def Deserializer(stream_or_string, app, **options):
    """
    Render file and then dispatch content to serializer
    """
    filename = options['filename']
    templ = mako.template.Template(stream_or_string.read())
    s = templ.render()
    filename = filename.rsplit('.', 1)[0]
    format = filename.rsplit('.', 1)[1]
    deserializer = get_deserializer(format)
    with tempfile.NamedTemporaryFile('r+', suffix='.sql', delete=False) as f:
        try:
            f.write(s)
            f.close()
            deserializer(f, app, **options)
        finally:
            os.remove(f.name)
