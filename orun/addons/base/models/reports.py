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
        params = xml.find('params')
        if params is not None:
            xml = params
        data['content'] = etree.tostring(xml, encoding='utf-8').decode('utf-8')
        return data

    def _export_report(self, format='pdf', params=None):
        qs = model = None
        if self.model:
            model = app[self.model]
            qs = model.objects.all()
        _params = defaultdict(list)
        if 'data' in params:
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
        elif params:
            where = params

        rep_type = None
        if self.view and self.view.template_name:
            rep_type = self.view.template_name.rsplit('.', 1)[1]
        types = {
            'html': 'orun.reports.engines.chrome.ChromeEngine',
            'mako': 'orun.reports.engines.chrome.ChromeEngine',
            'xml': 'orun.reports.engines.fastreports.FastReports',
            'frx': 'orun.reports.engines.fastreports.FastReports',
            None: 'orun.reports.engines.fastreports.FastReports',
        }

        if rep_type in ['frx', 'xml']:
            xml = self.view.get_xml(model)
        else:
            xml = self.view.render({})

        engine = get_engine(types[rep_type])
        rep = engine.auto_report(xml, format=format, model=model, query=qs, report_title=self.name, params=where)
        if isinstance(rep, str):
            return {
                'open': '/web/reports/' + rep,
                'name': self.name,
            }
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
    model = models.ForeignKey('ir.model', null=False)
    content = models.TextField()

    class Meta:
        name = 'ui.report.auto'
