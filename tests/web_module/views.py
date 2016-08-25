import json
from unittest import TestCase
from orun import app


class WebTestCase(TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_rpc(self):
        from orun.db import connection
        from base import models as base
        model = base.Model._build_model(app)
        with connection.schema_editor() as editor:
            editor.create_model(model)
        model.objects.create(name='Model 1')
        model.objects.create(name='Model 2')
        self.assertEqual(self.app.get('/api/rpc/call/sys.model/search/', query_string={'fields': ['name'], 'limit': 1}).status, '200 OK')
        obj = json.loads(self.app.get('/api/rpc/call/sys.model/name_search/', query_string={'name': 'Model 1'}).data.decode('utf-8'))
        self.assertEqual(len(obj), 1)
        self.assertEqual(obj[0][1], 'Model 1')
        obj = json.loads(self.app.get('/api/rpc/call/sys.model/new_get/').data.decode('utf-8'))['object_type']
        self.assertEqual(obj, 'user')
        obj = json.loads(self.app.get('/api/rpc/call/sys.model/name_search/', query_string={'name': 'Model'}).data.decode('utf-8'))
        self.assertEqual(len(obj), 2)
        self.assertEqual(self.app.get('/api/rpc/call/sys.model/search/', query_string={'fields': 'name'}).status, '200 OK')
