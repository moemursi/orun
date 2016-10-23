from orun import request
from orun.utils.json import jsonify
from orun import app, render_template
from orun.views import BaseView, route
from orun.auth.decorators import login_required


class WebClient(BaseView):
    route_base = '/web/'

    @route('/', defaults={'menu_id': None})
    @route('/menu/<menu_id>/')
    #@login_required(login_url='/login/')
    def index(self, menu_id=None):
        menu = app['ui.menu']
        context = {
            'current_menu': menu_id,
            'root_menu': menu.objects.filter(parent_id=None),
        }
        if menu_id:
            cur_menu = menu.objects.get(pk=menu_id)
            print(cur_menu.menu_set.all())
            context['current_menu'] = cur_menu
        return render_template('web/index.html', **context)

    @route('/action/<action_id>/')
    #@login_required(login_url='/login/')
    def action(self, action_id=None):
        action = app['sys.action']
        context = {
            'root_menu': app['ui.menu'].objects.filter(parent_id=None),
        }
        if action_id:
            action = action.objects.get(pk=action_id).get_action()
            cur_menu = None
            context['current_menu'] = cur_menu
            return jsonify(action.to_dict())
        return render_template('web/action.html', **context)

    @route('/client/i18n/catalog.js')
    def i18n_js_catalog(self):
        from .i18n import javascript_catalog
        return javascript_catalog(request, packages=[addon.name for addon in app.installed_modules])

    def login(self):
        return render_template('web/login.html')
