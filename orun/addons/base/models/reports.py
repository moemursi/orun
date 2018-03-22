import os
from collections import defaultdict

from orun import app, api
from orun.db import models
from orun.reports.engines import get_engine
from orun.utils.translation import gettext_lazy as _
from orun.utils.xml import etree
from .action import Action


class ReportAction(Action):
    report_type = models.CharField(32, null=False, verbose_name=_('Report Type'))
    model = models.CharField(128)
    view = models.ForeignKey('ui.view')

    class Meta:
        name = 'ir.action.report'

    def serialize(self, *args, **kwargs):
        data = super(ReportAction, self).serialize(*args, **kwargs)
        model = None
        if self.model:
            model = app[self.model]
        xml = self.view.get_xml(model)
        if model:
            data['fields'] = model.get_fields_info(xml=xml)
        data['content'] = etree.tostring(xml, encoding='utf-8').decode('utf-8')
        return data

    def _export_report(self, format='pdf', params=None):
        engine = get_engine()
        qs = model = None
        if self.model:
            model = app[self.model]
            qs = model.objects.all()
        xml = self.view.get_xml(model)
        _params = defaultdict(list)
        for crit in params['data']:
            for k, v in crit.items():
                if k.startswith('value'):
                    _params[crit['name']].append(v)
        where = {}
        for k, v in _params.items():
            if len(v) > 1:
                for i, val in enumerate(v):
                    where[k + str(i + 1)] = val
            else:
                where[k] = v[0]

        rep = engine.auto_report(xml, format=format, model=model, query=qs, report_title=self.name, params=where)
        if rep:
            if not isinstance(rep, str):
                rep = rep.export(format=format)
            out_file = '/web/reports/' + os.path.basename(rep)
            return {
                'open': out_file,
                'name': self.name,
            }

    @api.method
    def export_report(cls, id, format='pdf', params=None):
        rep = cls.objects.get(id)
        return rep._export_report(format=format, params=params)


class UserReport(models.Model):
    report = models.ForeignKey(ReportAction)
    company = models.ForeignKey('res.company')
    public = models.BooleanField(default=True)
    params = models.TextField()

    class Meta:
        name = 'usr.report'


class AutoReport(models.Model):
    name = models.CharField(128, null=False)
    model = models.ForeignKey('ir.model', null=False, db_index=True)
    content = models.TextField()

    class Meta:
        name = 'ui.report.auto'
