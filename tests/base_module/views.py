from lxml import etree
from orun import app
from unittest import TestCase


class ViewsTestCase(TestCase):
    def test_view_inheritance(self):
        from orun.db import connection
        from base import models
        View = models.View._build_model(app)
        with connection.schema_editor() as editor:
            editor.create_model(View)
            v = View.objects.create(name='vw_1', view_type='form', template_name='base/tests/test.view.html')
            v2 = View.objects.create(name='vw_1.1', view_type='form', parent_id=v.pk, template_name='base/tests/test2.view.html', mode='extension')
            View.objects.create(name='vw_1.2', view_type='form', parent=v2, template_name='base/tests/test3.view.html', mode='extension')
            count_elements = etree.XPath("count(//div[@id='div-3'])")
            self.assertEqual(count_elements(etree.fromstring(v.get_full_content())), 1)
            xml = View.objects.create(name='vw_1.3', template_name='base/tests/primary.view.html', view_type='form', parent=v, mode='primary').get_full_content()
            self.assertEqual(count_elements(etree.fromstring(xml)), 2)
