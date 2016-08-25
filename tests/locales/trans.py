from unittest import TestCase
from orun.apps import Application
from orun import env
from orun.utils.translation import gettext as _


class TransTestCase(TestCase):
    def setUp(self):
        self.app = Application('test_app', settings={'USE_I18N': True})

    def test_trans(self):
        # Default language en-us
        with self.app.app_context():
            self.assertEqual(_('Portuguese'), 'Portuguese')
            self.assertEqual(_('English'), 'English')
            self.assertEqual(env.LANGUAGE_CODE, 'en-us')

        # Nested trans context
        with self.app.app_context(LANGUAGE_CODE='pt-br'):
            self.assertEqual(_('Portuguese'), 'Português')
            self.assertEqual(_('English'), 'Inglês')

            with self.app.app_context():
                self.assertEqual(_('Portuguese'), 'Português')
                self.assertEqual(_('English'), 'Inglês')

                with self.app.app_context(LANGUAGE_CODE='es'):
                    self.assertEqual(_('Portuguese'), 'Portugués')
                    self.assertEqual(_('English'), 'Inglés')

            self.assertEqual(_('Portuguese'), 'Português')
            self.assertEqual(_('English'), 'Inglês')

        # Simple context
        with self.app.app_context(LANGUAGE_CODE='it'):
            self.assertEqual(_('Portuguese'), 'Portoghese')
            self.assertEqual(_('English'), 'Inglese')
