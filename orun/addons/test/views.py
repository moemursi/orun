from orun.views import BaseView


class Testview(BaseView):
    def index(self):
        from base.models import View
        view = View._meta.get_model()
        return 'test2'

    def _test_view(self):
        return 'test view 2'
