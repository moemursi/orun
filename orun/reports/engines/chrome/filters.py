import datetime
import decimal
import locale


def default_filter(value):
    # locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8}')
    if value is None:
        return ''
    elif isinstance(value, decimal.Decimal):
        return locale.format('%.2f', value)
    elif isinstance(value, datetime.datetime):
        return value.strftime('%x %H:%M')
    elif isinstance(value, datetime.date):
        return value.strftime('%x')
    return str(value)
