from orun.views import BaseView, route


class WebClient(BaseView):
    route_base = '/web/'

    def index(self):
        return 'test'

    def _test_view(self):
        return 'test view'

