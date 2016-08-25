from copy import copy
from unittest import TestCase
from orun import app


class ActionsTestCase(TestCase):
    def test_window_action(self):
        from orun.db import connection
        from base import models as base
        action = base.Action._build_model(app)
        window_action = base.WindowAction._build_model(app)
        model = base.Model._build_model(app)
        with connection.schema_editor() as editor:
            editor.create_model(model)
            editor.create_model(action)
            editor.create_model(window_action)
            wnd = window_action.objects.create(name='sys.action', model=model.objects.create(name='sys.action'))
            self.assertEqual(wnd.to_dict()['name'], 'sys.action')
            self.assertEqual(len(wnd.to_dict(fields=['name'])), 1)
            window_action.objects.create(name='sys.action.window', model=model.objects.create(name='sys.action.window'))
            self.assertEqual(len(window_action.search().to_list()), 2)
            self.assertEqual(window_action.search().names_get()[1][0], 2)
            self.assertEqual(window_action.search().count(), 2)
            wnd_copy = copy(wnd)
            self.assertEqual(wnd_copy.pk, None)
            self.assertEqual(wnd.name, wnd_copy.name)
            self.assertEqual(action.name_create('wnd action 2').name, 'wnd action 2')
            self.assertEqual(action.name_create.exposed, True)
