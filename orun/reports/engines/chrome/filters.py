import json
import types
import markupsafe
import datetime
import decimal
from itertools import groupby

from jinja2.filters import environmentfilter, make_attrgetter, _GroupTuple

from orun.utils import formats


def localize(value):
    if value is None:
        return ''
    elif isinstance(value, (decimal.Decimal, float)):
        return formats.number_format(value, 2, force_grouping=True)
    elif isinstance(value, datetime.datetime):
        return formats.date_format(value, 'SHORT_DATETIME_FORMAT')
    elif isinstance(value, datetime.date):
        return formats.date_format(value, 'SHORT_DATE_FORMAT')
    elif isinstance(value, types.GeneratorType):
        return json.dumps(list(value))

    return str(value)


def linebreaks(text):
    return text.replace('\n', markupsafe.Markup('<br/>'))


@environmentfilter
def do_groupby(environment, value, attribute):
    """Group a sequence of objects by a common attribute.

    If you for example have a list of dicts or objects that represent persons
    with `gender`, `first_name` and `last_name` attributes and you want to
    group all users by genders you can do something like the following
    snippet:

    .. sourcecode:: html+jinja

        <ul>
        {% for group in persons|groupby('gender') %}
            <li>{{ group.grouper }}<ul>
            {% for person in group.list %}
                <li>{{ person.first_name }} {{ person.last_name }}</li>
            {% endfor %}</ul></li>
        {% endfor %}
        </ul>

    Additionally it's possible to use tuple unpacking for the grouper and
    list:

    .. sourcecode:: html+jinja

        <ul>
        {% for grouper, list in persons|groupby('gender') %}
            ...
        {% endfor %}
        </ul>

    As you can see the item we're grouping by is stored in the `grouper`
    attribute and the `list` contains all the objects that have this grouper
    in common.

    .. versionchanged:: 2.6
       It's now possible to use dotted notation to group by the child
       attribute of another attribute.
    """
    expr = make_attrgetter(environment, attribute, lambda val: '' if val is None else val)
    return [_GroupTuple(key, list(values)) for key, values
            in groupby(sorted(value, key=expr), expr)]

