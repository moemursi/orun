"""
A XML Deserializer. Shortcut to deserialize complex structured Xml files.
"""
from xml.etree import ElementTree as etree

from orun.db import DEFAULT_DB_ALIAS, session
from orun.utils.translation import gettext as _
from orun.core.serializers import base
from orun.core.exceptions import ObjectDoesNotExist


class Deserializer(base.Deserializer):
    def deserialize(self):
        if not isinstance(self.stream_or_string, (bytes, str)):
            data = etree.parse(self.stream_or_string).getroot()
        elif isinstance(self.stream_or_string, bytes):
            data = etree.fromstring(self.stream_or_string.decode('utf-8'))
        else:
            data = etree.fromstring(self.stream_or_string)
        lst = []
        trans = data.attrib.get('translate')
        for el in data:
            obj = self.TAGS[el.tag](self, el, translate=trans)
            if isinstance(obj, list):
                lst.extend(obj)
            elif obj:
                lst.append(obj)
        return lst

    def read_object(self, obj, **attrs):
        Object = self.app['sys.object']
        ContentType = self.app['sys.model']
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
                    obj['fields'][child.attrib['name']] = Object.get_object(child.attrib['ref']).object_id
                elif 'model' in child.attrib:
                    obj['fields'][child.attrib['name']] = ContentType.objects.only('pk').get_by_natural_key(*child.attrib['model'].split('.')).pk
                else:
                    s = child.text
                    if 'translate' in child.attrib:
                        s = _(s)
                    obj['fields'][child.attrib['name']] = s

        obj_name = obj.pop('id')
        obj_id = None
        try:
            obj_id = Object.objects.filter(Object.name == obj_name).one()
            instance = obj_id.content_object
            for k, v in obj['fields'].items():
                setattr(instance, k, v)
            instance.save()
        except ObjectDoesNotExist:
            instance = self.build_instance(self.app[obj['model']], obj['fields'], attrs.get('using', DEFAULT_DB_ALIAS))
            instance.save()
            ct = ContentType.get_by_natural_key(instance._meta.name)
            obj_id = Object.create(
                app_label=self.app_config.app_label,
                name=obj_name,
                object_id=instance.pk,
                model=ct
            )
        return instance

    def read_menu(self, obj, parent=None, **attrs):
        Object = self.app['sys.object']
        lst = []
        action_id = obj.attrib.get('action')
        if action_id:
            sys_obj = Object
            try:
                action_id = sys_obj.get_object(action_id).object_id
            except ObjectDoesNotExist:
                raise Exception('The object id "%s" does not exist' % action_id)
        s = obj.attrib.get('name')
        if attrs.get('translate'):
            s = _(s)
        fields = {
            'parent_id': obj.attrib.get('parent', parent),
            'action_id': action_id,
            'name': s,
        }
        if obj.attrib.get('sequence'):
            fields['sequence'] = obj.attrib['sequence']
        menu = {
            'model': 'ui.menu',
            'id': obj.attrib.get('id'),
            'fields': fields
        }
        lst.append(menu)
        menu['children'] = []
        menu = self.read_object(menu, **attrs)
        for child in obj:
            r = self.read_menu(child, parent=menu.pk, **attrs)
            lst.extend(r)
        return lst

    def read_action(self, obj, **attrs):
        ContentType = self.app['sys.model']
        act = obj.attrib['type']
        s = obj.attrib['name']
        if obj.attrib.get('name'):
            s = _(s)
        fields = {
            'name': s,
        }
        if 'model' in obj.attrib:
            model = self.app[obj.attrib['model']]
            fields['model'] = ContentType.get_by_natural_key(model._meta.name)
        action = {
            'model': act,
            'id': obj.attrib['id'],
            'children': [],
            'fields': fields,
        }
        return self.read_object(action, **attrs)

    def read_template(self, obj, **attrs):
        templ = {
            'model': 'ui.view',
            'type': 'template',
            'id': obj.attrib.get('id'),
        }
        return self.read_object(templ)

    def read_view(self, obj, **attrs):
        view = {
            'model': 'ui.view',
            'id': obj.attrib.get('id'),
            'type': obj.attrib.get('type', 'view'),
        }
        return self.read_object(view)

    TAGS = {
        'object': read_object,
        'action': read_action,
        'template': read_template,
        'view': read_view,
        'menuitem': read_menu,
    }
