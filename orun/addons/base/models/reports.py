import os

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
        name = 'sys.action.report'

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
        model = app[self.model]
        xml = self.view.get_xml(model)
        qs = model.objects.all()
        if params:
            criterion = params.pop('data', [])
            for crit in criterion:
                print(crit)
        rep = engine.auto_report(xml, model=model, query=qs, report_title=self.name)
        out_file = '/web/reports/' + os.path.basename(rep.export(format=format))
        return {
            'open': out_file,
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
    model = models.ForeignKey('sys.model', null=False, db_index=True)
    content = models.TextField()

    class Meta:
        name = 'ui.report.auto'
