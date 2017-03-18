from flask import redirect
from orun.conf import settings
from orun import request
from orun.utils.json import jsonify
from orun.utils.translation import gettext
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
            'root_menu': menu.objects.filter(menu.parent_id == None),
            'settings': settings,
        }
        if menu_id:
            cur_menu = menu.objects.get(menu_id)
            context['current_menu'] = cur_menu
        else:
            return redirect('/web/menu/%s/' % menu.objects.filter(menu.parent_id == None)[0].id)
        return render_template('web/index.html', _=gettext, **context)

    @route('/action/<action_id>/')
    #@login_required(login_url='/login/')
    def action(self, action_id=None):
        Action = app['sys.action']
        Menu = app['ui.menu']
        context = {
            'root_menu': Menu.objects.filter(Menu.parent_id == None),
        }
        if action_id:
            action = Action.objects.get(action_id).get_action()
            if action.action_type == 'sys.action.window':
                action = app['sys.action.window'].objects.get(action.id)
            cur_menu = None
            context['current_menu'] = cur_menu
            return jsonify(action)
        return render_template('web/action.html', **context)

    @route('/client/i18n/catalog.js')
    def i18n_js_catalog(self):
        from .i18n import javascript_catalog
        return javascript_catalog(request, packages=[addon.name for addon in app.addons])

    def login(self):
        return render_template('web/login.html')

    def logout(self):
        return render_template('web/login.html')
