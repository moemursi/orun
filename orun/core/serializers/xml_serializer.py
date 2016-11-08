from lxml import html as etree

from orun.utils.translation import gettext as _
from orun import app, env
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
            if 'ref' in child.attrib:
                sys_obj = app['sys.object']
                obj['fields'][child.attrib['name']] = sys_obj.get_object(child.attrib['ref']).object_id
            elif 'model' in child.attrib:
                sys_model = app['sys.model']
                obj['fields'][child.attrib['name']] = sys_model.objects.only('pk').get(name=child.attrib['model']).pk
            else:
                s = child.text
                if 'translate' in child.attrib:
                    s = _(s)
                obj['fields'][child.attrib['name']] = s

    obj = list(PythonDeserializer([obj], **attrs))
    return obj


def read_menu(obj, parent=None, **attrs):
    lst = []
    action_id = obj.attrib.get('action')
    if action_id:
        sys_obj = app['sys.object']
        action_id = sys_obj.get_object(action_id).object_id
    s = obj.attrib.get('name')
    if obj.attrib.get('translate'):
        s = _(s)
    menu = {
        'model': 'ui.menu',
        'id': obj.attrib.get('id'),
        'fields': {
            'parent_id': obj.attrib.get('parent', parent),
            'action_id': action_id,
            'name': s,
        }
    }
    lst.append(menu)
    menu['children'] = []
    menu = read_object(menu, **attrs)
    for child in obj:
        r = read_menu(child, parent=menu[0].pk, **attrs)
        lst.extend(r)
    return lst


def read_action(obj, **attrs):
    act = obj.attrib['type']
    s = obj.attrib['name']
    if obj.attrib.get('name'):
        s = _(s)
    fields = {
        'name': s,
    }
    sys_model = app['sys.model']
    if 'model' in obj.attrib:
        fields['model'] = sys_model.objects.only('pk').get(name=obj.attrib['model']).pk
    action = {
        'model': act,
        'id': obj.attrib['id'],
        'children': [],
        'fields': fields,
    }
    return read_object(action, **attrs)


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
    trans = data.attrib.get('translate')
    for el in data:
        obj = TAGS[el.tag](el, app_label=app_label, translate=trans)
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
