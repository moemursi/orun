from orun.test import ApplicationTestCase
from orun.core.exceptions import ValidationError


class ApprovalTestCase(ApplicationTestCase):
    addons = ['mail_module']

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        with cls.app.app_context():
            cls.app.create_all()
            Model = cls.app['ir.model']
            cls.model = Model.create(name='mail_module_test.my.document')

    def test_current_level(self):
        with self.app.app_context():
            # empty model
            model = self.app['mail_module_test.my.document']
            model.objects.delete()
            model.create(name='Document 1', status='level1')

            ApprovalModel = self.app['mail.approval.model']
            ApprovalModel.objects.delete()
            approval_model = ApprovalModel.create(name='Document 1 Approval Levels', model=self.model)

            ApprovalLevel = self.app['mail.approval.level']
            ApprovalLevel.objects.delete()
            ApprovalLevel.create(approval_model=approval_model, sequence=1, level='level1', permission='allow')
            ApprovalLevel.create(approval_model=approval_model, sequence=2, level='level2', next_level='level3', permission='allow')

            # auto evaluate approval
            obj = model.create(name='Document 2', status='level1')
            self.assertEqual(obj.current_approval_level.level, 'level2')
            self.assertEqual(obj.status, 'level3')

    def test_approval_flow(self):
        with self.app.app_context():
            model = self.app['mail_module_test.my.document']
            model.objects.delete()
            model.create(name='Document 2', status='level1')

            ApprovalModel = self.app['mail.approval.model']
            ApprovalModel.objects.delete()
            approval_model = ApprovalModel.create(name='Document 1 Approval Levels', model=self.model)

            ApprovalLevel = self.app['mail.approval.level']
            ApprovalLevel.objects.delete()
            ApprovalLevel.create(approval_model=approval_model, sequence=1, level='level1', permission='user')
            ApprovalLevel.create(approval_model=approval_model, sequence=2, level='level2', next_level='level3', permission='user')

            # keep the original approval level
            obj = model.create(name='Document 2', status='level1')
            self.assertEqual(obj.current_approval_level.level, 'level1')
            self.assertEqual(obj.status, 'level1')

            obj.approve_document_level()
            obj.save()
            self.assertEqual(obj.current_approval_level.level, 'level2')
            self.assertEqual(obj.status, 'level2')

            obj.approve_document_level()
            obj.save()
            self.assertEqual(obj.current_approval_level.level, 'level2')
            self.assertEqual(obj.status, 'level3')

    def test_permission(self):
        with self.app.app_context():
            User = self.app['auth.user']
            manager = User.create(username='manager_user')
            user = User.create(username='limited_user')

            model = self.app['mail_module_test.my.document']
            model.objects.delete()
            model.create(name='Document 2', status='level1')

            ApprovalModel = self.app['mail.approval.model']
            ApprovalModel.objects.delete()
            approval_model = ApprovalModel.create(name='Document 1 Approval Levels', model=self.model)

            ApprovalLevel = self.app['mail.approval.level']
            ApprovalLevel.objects.delete()
            ApprovalLevel.create(approval_model=approval_model, sequence=1, level='level1', permission='user', user=manager)
            ApprovalLevel.create(approval_model=approval_model, sequence=2, level='level2', next_level='level3', permission='user', user=manager)

            # keep the original approval level
            obj = model.create(name='Document 2', status='level1')
            self.assertEqual(obj.current_approval_level.level, 'level1')
            self.assertEqual(obj.status, 'level1')

            with self.assertRaises(ValidationError):
                with self.app.app_context(user_id=user.pk):
                    obj.approve_document_level()
                    obj.save()
                    self.assertEqual(obj.current_approval_level.level, 'level2')
                    self.assertEqual(obj.status, 'level2')

                    obj.approve_document_level()
                    obj.save()
                    self.assertEqual(obj.current_approval_level.level, 'level2')
                    self.assertEqual(obj.status, 'level3')

            with self.app.app_context(user_id=manager.pk):
                obj.approve_document_level()
                obj.save()
                self.assertEqual(obj.current_approval_level.level, 'level2')
                self.assertEqual(obj.status, 'level2')


