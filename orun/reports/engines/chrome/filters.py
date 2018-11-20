import json
import types
import markupsafe
import datetime
import decimal

from orun.utils import formats


def localize(value):
    if value is None:
        return ''
    elif isinstance(value, (decimal.Decimal, float)):
        return formats.number_format(value, 2, force_grouping=True)
    elif isinstance(value, datetime.datetime):
        return formats.date_format(value, 'SHORT_DATETIME_FORMAT')
    elif isinstance(value, datetime.date):
        return formats.date_format(value, 'dd/MM/yyyy')
    elif isinstance(value, types.GeneratorType):
        return json.dumps(list(value))

    return str(value)


def linebreaks(text):
    return text.replace('\n', markupsafe.Markup('<br/>'))
