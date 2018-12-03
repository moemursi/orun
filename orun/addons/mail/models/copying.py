import json
from orun import api, app
from orun.db import models
from orun.utils.translation import gettext_lazy as _


class CopyTo(models.Model):
    source_model = models.ForeignKey('ir.model', null=False, label=_('Source Model'))
    action = models.ForeignKey('ir.action.window', label=_('Action (Optional)'))
    dest_model = models.ForeignKey('ir.model', null=False, label=_('Destination Model'))
    caption = models.CharField(label=_('Caption'))
    active = models.BooleanField(default=True)
    fields_mapping = models.TextField(label=_('Fields Mapping'), template={'form': 'view.form.code-editor.pug'})

    class Meta:
        name = 'ir.copy.to'
        verbose_name = _('Copying Settings')
        verbose_name_plural = _('Copying Settings')

    def __str__(self):
        return 'Copy from "%s" to "%s"' % (self.source_model, self.dest_model)

    @api.method
    def get_copy_to_choices(self, model):
        opts = self.objects.filter(source_model__name=model)
        return [
            {'id': opt.pk, 'name': str(opt.caption or opt.dest_model.model_class()._meta.verbose_name)}
            for opt in opts
        ]

    @api.method
    def copy_to(self, source, dest):
        source = self.env[source]
        dest = self.env[dest]
        ir_copy_to = app['ir.copy.to'].objects.filter(
            source_model__name=source._meta.name,
            dest_model__name=dest._meta.name,
            active=True,
        ).one()
        mapping = ir_copy_to.fields_mapping
        dest = source.env[dest]
        if mapping == '*':
            mapping = auto_mapping_fields(source, dest)
        else:
            mapping = json.loads(mapping)
        values = copy_to_dest(mapping, dest, source.to_json())
        return {
            'model': source._meta.name,
            'value': values,
        }


def auto_mapping_fields(source, dest):
    res = {}
    for f in source._meta.fields:
        if f.copy and f.name in dest._meta.fields._dict:
            name = f.name
            df = dest._meta.fields[name]
            if f.one_to_many:
                assert df.one_to_many
                res[f] = (df, auto_mapping_fields(f.rel.model, df.rel.model))
            else:
                res[f] = (df, None)
    return res


def get_val(obj, attr: str):
    if attr.startswith('='):
        return attr[1:]
    else:
        return obj.get(attr)


def copy_to_dest(mapping, dest, source):
    values = {}
    for k, v in mapping.items():
        field = dest._meta.fields[k]
        if field.one_to_many:
            lines = source[v['field']]
            if v and lines:
                values[k] = []
                for line in lines:
                    values[k].append({'action': 'CREATE', 'values': copy_to_dest(v['values'], field.model, line)})
        else:
            values[k] = get_val(source, v)
    return values

