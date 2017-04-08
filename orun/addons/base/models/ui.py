import os
from jinja2 import Environment, FunctionLoader
from xml.etree import ElementTree as etree
import base64

from orun.conf import settings
from orun import app, render_template
#from orun.template import Template
from orun.apps import registry
from orun.db import models
from orun.utils.translation import gettext, gettext_lazy as _


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
        ('chart', 'Chart'),
        ('calendar', 'Calendar'),
        ('search', 'Search'),
        ('template', 'Template'),
        ('custom', 'Custom'),
    ), null=False)
    mode = models.CharField(16, choices=(
        ('primary', _('Primary')),
        ('extension', _('Extension'))
    ), default='primary', null=False)
    model = models.ForeignKey('sys.model')
    priority = models.IntegerField(_('Priority'), default=99, null=False)
    template_name = models.CharField(max_length=255)
    content = models.TextField()

    class Meta:
        name = 'ui.view'
        ordering = ('name', 'priority')

    def save(self, *args, **kwargs):
        if self.parent and self.mode is None:
            self.mode = 'extension'
        if self.view_type is None and self.content:
            xml = etree.fromstring(self.content)
            self.view_type = xml.tag
        super(View, self).save(*args, **kwargs)

    def get_content(self, model):
        if settings.DEBUG and self.template_name:
            return self.render(self.template_name.split(':')[-1], context={'opts': model._meta})
        if self.content:
            return self.content
        else:
            # Load in the FileSystem
            return self.render(self.template_name)

    def get_full_content(self, parent=None):
        if self.parent and self.mode == 'primary':
            s = self.parent.get_full_content()
            content = Template(self.parent.get_full_content())
            content.merge(self.get_content())
        elif parent:
            content = parent
        else:
            content = Template(self.get_content())
        children = self.__class__.objects.filter(parent_id=self.pk, mode='extension')
        for obj in children:
            content.merge(obj.get_content())
            obj.get_full_content(content)
        if parent is None:
            return content.render()

    def render(self, template_name, context={}, parent=None):
        context['_'] = gettext
        return render_template(template_name, **context)
        #return views_env.get_template(template_name).render(**context)

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
