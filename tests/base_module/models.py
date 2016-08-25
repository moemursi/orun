from orun import app
from unittest import TestCase


class ModelsTestCase(TestCase):
    def setUp(self):
        pass

    def create_database(self):
        from orun.db import connection
        from base import models as base

        action = base.Action._build_model(app)
        window_action = base.WindowAction._build_model(app)
        view = base.View._build_model(app)
        usr = base.User._build_model(app)
        partner = base.Partner._build_model(app)
        company = base.Company._build_model(app)

        with connection.schema_editor() as editor:
            editor.create_model(action)
            editor.create_model(window_action)
            editor.create_model(view)
            editor.create_model(company)
            editor.create_model(usr)
            editor.create_model(partner)
            editor.create_model(usr.companies.through)
        view.objects.create(name='vw1', view_type='list')
        v = view()
        v.name = 'vw 2'
        v.view_type = 'list'
        v.save()
        window_action.objects.create(name='Wnd Action 1', view=v)
        v = view()
        v.name = 'new view'
        v.view_type = 'form'
        v.save()
        act = window_action(name='action 1')
        act.view = v
        act.save()
        u = usr.objects.create(name='user 1')
        p = partner.objects.get()
        self.assertEqual(p.pk, u.id)
        self.assertEqual(p.name, u.name)
        comp1 = company.objects.create(name='Company 1')
        comp2 = company.objects.create(name='Company 2')
        u = usr.objects.get()
        u.companies.add(comp1, comp2)
        u.companies.clear()

    def test_objects(self):
        from orun.db import connection
        from base import models as base

        objects = base.Object._build_model(app)
        model = base.Model._build_model(app)

        with connection.schema_editor() as editor:
            editor.create_model(model)
            editor.create_model(objects)
            m = model.objects.create(name='sys.model', object_name='model')
            objects.objects.create(name='object 1', model_id=m.pk, object_id=m.pk, module='test')
            for obj in objects.objects.all():
                self.assertEqual(obj.content_object.model_class()._meta.name, model._meta.name)
