"""
A XML Deserializer. Shortcut to deserialize complex structured Xml files.
"""
import os
import functools
from xml.etree import ElementTree as etree

from orun import app
from orun.db import DEFAULT_DB_ALIAS, session
from orun.db import models
from orun.utils.translation import gettext as _
from orun.core.serializers import base
from orun.core.serializers.python import get_prep_value
from orun.core.exceptions import ObjectDoesNotExist


def ref(app, xml_id):
    Object = app['sys.object']
    return Object.get_object(xml_id).object_id


class Deserializer(base.Deserializer):
    def __init__(self, stream_or_string, app, app_config=None, **kwargs):
        super(Deserializer, self).__init__(stream_or_string, app, app_config=app_config, **kwargs)
        print('READING FILE', self.options)
        self.deserialize()

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
        ct = self.app['sys.model']
        if not isinstance(obj, dict):
            values = obj.getchildren()
            obj = dict(obj.attrib)
        else:
            values = obj.get('children', [])

        if 'fields' not in obj:
            obj['fields'] = {}

        for child in values:
            if child.tag == 'field':
                if 'ref' in child.attrib:
                    try:
                        obj['fields'][child.attrib['name']] = ref(self.app, child.attrib['ref'])
                    except:
                        print('Error reading xml file file: ref:', child.attrib['ref'], self.app, self.options['filename'])
                        raise
                elif 'eval' in child.attrib:
                    obj['fields'][child.attrib['name']] = eval(child.attrib['eval'], {'ref': functools.partial(ref, self.app)})
                elif 'model' in child.attrib:
                    obj['fields'][child.attrib['name']] = ct.objects.only('pk').filter(ct.c.name == child.attrib['model']).first().pk
                else:
                    s = child.text
                    if 'translate' in child.attrib:
                        s = _(s)
                    obj['fields'][child.attrib['name']] = s

        obj_name = obj.pop('id')
        obj_id = None
        Model = self.app[obj['model']]
        values = obj['fields']

        # # ui.view special case
        # if Model._meta.name == 'ui.view' and 'template_name' in values:
        #     template_name = values['template_name']
        #     values['template_name'] = self.app_config.schema + ':' + template_name
        #     assert '..' not in template_name
        #     template_name = os.path.join(self.app_config.path, self.app_config.template_folder, template_name)
        #     with open(template_name, encoding='utf-8') as f:
        #         values['content'] = f.read()

        Object = app['sys.object']
        try:
            obj_id = Object.objects.filter(Object.name == obj_name).one()
            instance = obj_id.object
        except ObjectDoesNotExist:
            instance = Model()
        pk = instance.pk
        children = {}
        for k, v in values.items():
            # Check if there's a list of objects
            if isinstance(v, list) and isinstance(instance._meta.fields_dict[k], models.OneToManyField):
                children[k] = v
            else:
                setattr(instance, *get_prep_value(Model, k, v))
        instance.save()
        if pk is None:
            ct = ct.get_by_natural_key(instance._meta.name)
            obj_id = Object.create(
                app_label=self.app_config.app_label,
                name=obj_name,
                object_id=instance.pk,
                model=ct
            )
        for child, v in children.items():
            # Delete all items
            getattr(instance, child).delete()
            # Re-eval the xml data
            instance._meta.fields_dict[k].deserialize(v, instance)
        return instance

    def read_menu(self, obj, parent=None, **attrs):
        Object = self.app['sys.object']
        lst = []
        action = None
        action_id = obj.attrib.get('action')
        if action_id:
            sys_obj = Object
            try:
                action = sys_obj.get_object(action_id).object
                action_id = action.pk
            except ObjectDoesNotExist:
                raise Exception('The object id "%s" does not exist' % action_id)
        s = obj.attrib.get('name')
        if s is None and action:
            s = action.name
        elif attrs.get('translate'):
            s = _(s)
        if 'parent' in obj.attrib:
            parent = Object.get_object(obj.attrib['parent']).object_id
        fields = {
            'parent_id': parent,
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
            try:
                fields['model'] = ContentType.get_by_natural_key(obj.attrib['model'])
            except:
                raise Exception('"%s" ContentType not found on app %s' % (obj.attrib['model'], self.app_config.name))
        action = {
            'model': act,
            'id': obj.attrib['id'],
            'children': obj.getchildren(),
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

    def read_report(self, obj, **attrs):
        model = obj.attrib.get('model')
        if model:
            ct = self.app['sys.model']
        view = {
            'model': 'ui.view',
            'id': obj.attrib.get('view-id'),
            'fields': {
                'template_name': obj.attrib.get('template'),
                'name': obj.attrib.get('view-id'),
                'model': (model and ct.objects.only('pk').filter(ct.c.name == model).one()) or None,
            },
        }
        view = self.read_object(view)
        report = {
            'model': 'sys.action.report',
            'id': obj.attrib.get('id'),
            'fields': {
                'report_type': obj.attrib.get('type', 'paginated'),
                'name': obj.attrib.get('name'),
                'view': view,
                'model': model,
            }
        }
        return self.read_object(report)

    TAGS = {
        'object': read_object,
        'action': read_action,
        'template': read_template,
        'view': read_view,
        'menuitem': read_menu,
        'report': read_report,
    }
