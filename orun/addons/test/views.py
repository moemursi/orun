from web.views import client


class Testview(client.WebClient):
    def index(self):
        from base.models import View
        view = View.get_model()
        print(view.mro())
        return 'test2'

    def _test_view(self):
        return 'test view 2'
