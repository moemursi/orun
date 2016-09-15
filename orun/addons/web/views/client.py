from orun import render_template
from orun.views import BaseView, route
from orun.auth.decorators import login_required


class WebClient(BaseView):
    route_base = '/web/'

    @route('/')
    @login_required(login_url='/login/')
    def index(self):
        return render_template('web/index.html')

    def login(self):
        return render_template('web/login.html')

    def _test_view(self):
        return 'test view'

