import string
import random
from orun.test.client import ClientTestCase
from orun import app, session
import orun.auth
from orun.auth import authenticate
import myapp.models


class ChangeTestCase(ClientTestCase):
    """
    Test onchange field event.
    """
    @classmethod
    def setUpClass(cls):
        User = app['auth.user']
        cls.user = u = User(name='Test User', username='test@localhost', is_staff=True, is_superuser=True)
        cls.pwd = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        u.set_password(cls.pwd)
        u.save()
        cls.client = app.test_client()

    def test_change_event(self):
        r = self.rpc('myapp.changemodel', 'on_field_change', {'args': ['change_field']})
        print(r)
