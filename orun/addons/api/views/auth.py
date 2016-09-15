from orun.views import BaseView, route


class Auth(BaseView):
    @route('/api/auth/login/', method=['POST'])
    def login(self):
        pass
