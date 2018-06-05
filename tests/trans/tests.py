from unittest import TestCase

from orun import app
from orun.utils.translation import gettext


class TranslationTestCase(TestCase):
    def test_trans(self):
        self.assertEqual(gettext('User'), 'User')
        with app.app_context(LANGUAGE_CODE='pt-br'):
            self.assertEqual(gettext('User'), 'Usuário')

            with app.app_context():
                self.assertEqual(gettext('User'), 'Usuário')

                with app.app_context(LANGUAGE_CODE='en-us'):
                    self.assertEqual(gettext('User'), 'User')
                self.assertEqual(gettext('User'), 'Usuário')

            self.assertEqual(gettext('User'), 'Usuário')
        self.assertEqual(gettext('User'), 'User')
