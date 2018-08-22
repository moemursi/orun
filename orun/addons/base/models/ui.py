import os
import re

from jinja2 import Environment, FunctionLoader

from orun import g, app
from orun import render_template
from orun import render_template_string
from orun.apps import registry
from orun.conf import settings
from orun.db import models
from orun.utils.translation import gettext, gettext_lazy as _
from orun.utils.xml import etree


def get_template(template):
    # TODO try to find on db (if not found, try to search on file system)
    app_label = template.split('/', 1)[0]
    addon = registry.addons[app_label]
    f = os.path.join(addon.root_path, addon.template_folder, template)
    if os.path.isfile(f):
        with open(f, encoding='utf-8') as tmpl:
            return tmpl.read()
    #dirs = [os.path.join(addon.root_path, addon.template_folder) for addon in app.installed_modules if addon.template_folder]
    #dirs = [d for d in dirs if os.path.isdir(d)]
    #for dir in dirs:
    #    fname = os.path.join(dir, template)

views_env = Environment(loader=FunctionLoader(get_template))


class View(models.Model):
    name = models.CharField(max_length=100)
    active = models.BooleanField(default=True)
    parent = models.ForeignKey('self')
    view_type = models.CharField(64, choices=(
        ('list', 'List'),
        ('form', 'Form'),
        ('card', 'Card'),
        ('chart', 'Chart'),
        ('calendar', 'Calendar'),
        ('search', 'Search'),
        ('template', 'Template'),
        ('report', 'Report'),
        ('custom', 'Custom'),
    ), null=False)
    mode = models.CharField(16, choices=(
        ('primary', _('Primary')),
        ('extension', _('Extension'))
    ), default='primary', null=False)
    model = models.CharField(128, db_index=True)
    priority = models.IntegerField(_('Priority'), default=99, null=False)
    template_name = models.CharField(max_length=255)
    content = models.TextField()

    class Meta:
        name = 'ui.view'
        ordering = ('name', 'priority')

    def save(self, *args, **kwargs):
        if self.parent_id and self.mode is None:
            self.mode = 'extension'
        if self.view_type is None:
            xml = etree.fromstring(self.render({}))
            self.view_type = xml.tag
        super(View, self).save(*args, **kwargs)

    def get_content(self, model):
        return etree.tostring(self.get_xml(model))

    def get_xml(self, model):
        context = {'opts': model._meta if model else None}
        return self.compile(context)

    def xpath(self, source, element):
        pos = element.attrib.get('position')
        expr = element.attrib.get('expr')
        target = source
        if expr:
            target = target.xpath(expr)[0]
        if pos == 'append':
            for child in element:
                target.append(etree.fromstring(etree.tostring(child)))
        elif pos == 'before':
            parent = target.getparent()
            idx = parent.index(target)
            for child in reversed(element):
                parent.insert(idx, etree.fromstring(etree.tostring(child)))
        elif pos == 'after':
            parent = target.getparent()
            idx = parent.index(target) + 1
            for child in reversed(element):
                parent.insert(idx, etree.fromstring(etree.tostring(child)))
        elif pos == 'attributes':
            for child in element:
                target.attrib[child.attrib['name']] = child.text
        elif pos == 'replace':
            target.getparent().remove(target)

    def merge(self, source, dest):
        for child in dest:
            if child.tag == 'view':
                self.merge(source, child)
            elif child.tag == 'xpath':
                self.xpath(source, child)

    def compile(self, context, parent=None):
        # TODO report inheritance
        if self.view_type == 'report':
            return self._get_content()
        xml = etree.fromstring(self._get_content())
        if self.parent and self.mode == 'primary':
            parent_xml = etree.fromstring(self.parent.render(context))
            self.merge(parent_xml, xml)
            xml = parent_xml

        view_cls = self.__class__
        children = view_cls.objects.filter(view_cls.c.parent_id == self.pk, view_cls.c.mode == 'extension')
        for child in children:
            self.merge(xml, etree.fromstring(child._get_content()))
        return xml

    def _get_content(self):
        templ = app.jinja_env.get_or_select_template(self.template_name.split(':')[-1])
        res = open(templ.filename).read()
        return res

    def render(self, context):
        context['_'] = gettext
        if settings.DEBUG and self.template_name:
            return render_template(self.template_name.split(':')[-1], **context)
        return render_template_string(self.content, **context)

    @classmethod
    def generate_view(self, model, view_type='form'):
        opts = model._meta
        return render_template([
            'views/%s/%s.xml' % (opts.name, view_type),
            'views/%s/%s.xml' % (opts.app_label, view_type),
            'views/%s.xml' % view_type,
        ], opts=opts, _=gettext)


class CustomView(models.Model):
    user = models.ForeignKey('auth.user', null=False)
    view = models.ForeignKey(View, null=False)
    content = models.TextField()

    class Meta:
        name = 'ui.view.custom'


class Filter(models.Model):
    name = models.CharField(256, null=False)
    user = models.ForeignKey('auth.user', default=lambda x: g.user, on_delete=models.CASCADE)
    domain = models.TextField()
    context = models.TextField()
    sort = models.TextField()
    is_default = models.BooleanField(default=False)
    action = models.ForeignKey('ir.action')
    active = models.BooleanField(default=True)

    class Meta:
        name = 'ui.filter'
