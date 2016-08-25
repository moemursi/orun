from lxml import html as etree

from orun import app
from orun.core.serializers.python import (
    Deserializer as PythonDeserializer, Serializer as PythonSerializer,
)


def read_object(obj, **attrs):
    if not isinstance(obj, dict):
        values = obj.getchildren()
        obj = dict(obj.attrib)
    else:
        values = obj['children']

    if 'fields' not in obj:
        obj['fields'] = {}

    for child in values:
        if child.tag == 'field':
            obj['fields'][child.attrib['name']] = child.text

    obj = list(PythonDeserializer([obj], **attrs))
    return obj


def read_menu(obj, parent=None, **attrs):
    lst = []
    menu = {
        'model': 'ui.menu',
        'id': obj.attrib.get('id'),
        'values': {
            'parent': obj.attrib.get('parent'),
            'action': obj.attrib.get('action'),
        }
    }
    lst.append(menu)
    menu = read_object(menu, **attrs)
    for child in obj:
        r = read_menu(child, parent=menu, **attrs)
        lst.extend(r)
    return lst


def read_action(obj, **attrs):
    tp = obj.attrib['type']
    if tp == 'window':
        act = 'sys.action.window'
    else:
        act = 'sys.action'
    action = {
        'model': act,
        'id': obj.attrib['id'],
    }
    return read_object(action)


def read_template(obj, **attrs):
    templ = {
        'model': 'ui.view',
        'type': 'template',
        'id': obj.attrib.get('id'),
    }
    return read_object(templ)


def read_view(obj, **attrs):
    view = {
        'model': 'ui.view',
        'id': obj.attrib.get('id'),
        'type': obj.attrib.get('type', 'view'),
    }
    return read_object(view)

TAGS = {
    'object': read_object,
    'action': read_action,
    'template': read_template,
    'view': read_view,
    'menuitem': read_menu,
}


def Deserializer(stream_or_string, app_label=None, **options):
    if not isinstance(stream_or_string, (bytes, str)):
        stream_or_string = stream_or_string.read()
    if isinstance(stream_or_string, bytes):
        stream_or_string = stream_or_string.decode('utf-8')
    data = etree.fromstring(stream_or_string)
    lst = []
    for el in data:
        obj = TAGS[el.tag](el, app_label=app_label)
        if isinstance(obj, list):
            lst.extend(obj)
        elif obj:
            lst.append(obj)
    return lst


if __name__ == '__main__':
    s = '''<?xml version="1.0"?>
    <data>
        <object id="object-1" pk="1" model="model-1">
        </object>
        <object id="object-2" pk="1" model="model-1">
        </object>
        <action id="action-1" type="window">Action 1</action>
        <menuitem id="menu-id">
            <menuitem id="submenu-id"/>
        </menuitem>
        <template id="template-1">
            {% block content %}
            <p>test</p>
            {% endblock %}
        </template>
    </data>
    '''
    print(Deserializer(s))
