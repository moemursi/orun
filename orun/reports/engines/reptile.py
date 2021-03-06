import os
from lxml import etree
import reptile
from reptile.exports import pdf
from orun import app


class ReptileEngine:
    def __init__(self):
        reptile.ReportEngine.env = app.report_env

    def auto_report(self, xml, *args, **kwargs):
        return self.from_xml(xml, *args, **kwargs)

    def create_report(self, xml, **kwargs):
        rep = reptile.Report(params=kwargs.get('params'))
        rep.from_string(xml)
        return rep

    def from_xml(self, xml, output_file, connection, **kwargs):
        report = self.create_report(xml, **kwargs)
        report.default_connection = connection
        doc = report.prepare()
        pdf.Export(doc).export(output_file)
        return os.path.basename(output_file)

    def extract_params(self, xml):
        doc = etree.fromstring(xml)
        return doc.find('.//params')

