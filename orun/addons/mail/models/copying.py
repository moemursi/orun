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
    fields_mapping = models.TextField(label=_('Fields Mapping'))

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


def copy_to_dest(mapping, obj):
    values = {}
    for k, v in mapping.items():
        v, child = v
        name = v.name
        value = obj.get(k.name)
        if k.one_to_many:
            if value:
                for val in value:
                    values[name] = copy_to_dest(child, val)
        else:
            values[name]= value
    return values


def copy_to(source, dest):
    Model = app['ir.model']
    ir_copy_to = app['ir.copy.to'].objects.filter(
        source_model=Model.get_by_natural_key(source._meta.name),
        dest_model=Model.get_by_natural_key(dest),
        active=True,
    ).one()
    mapping = ir_copy_to.fields_mapping
    dest = source.env[dest]
    if mapping == '*':
        mapping = auto_mapping_fields(source, dest)
    else:
        mapping = json.loads(mapping)
    values = copy_to_dest(mapping, source.to_json())
    return dest.create(**values)


models.Model.copy_to = api.record(copy_to)

