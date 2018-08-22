from orun import Application
from unittest import TestCase


class ReportTestCase(TestCase):
    def test_chrome_report(self):
        from orun.reports.engines import chrome
        chrome.ReportEngine.from_file('files/test-xml.xml')
