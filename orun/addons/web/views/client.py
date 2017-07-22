from flask import redirect, send_from_directory, session, url_for, flash
from orun.conf import settings
from orun import request
from orun.utils.json import jsonify
from orun.utils.translation import gettext
from orun import app, render_template
from orun.views import BaseView, route
from orun.auth.decorators import login_required
from orun import auth


class WebClient(BaseView):
    route_base = '/web/'

    @route('/', defaults={'menu_id': None})
    @route('/menu/<menu_id>/')
    @login_required
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
            main_menu = menu.objects.filter(menu.parent_id == None).first()
            return redirect('/web/menu/%s/' % main_menu.id)
        return render_template('web/index.html', _=gettext, **context)

    @route('/action/<action_id>/')
    @login_required
    def action(self, action_id=None):
        Action = app['sys.action']
        Menu = app['ui.menu']
        context = {
            'root_menu': Menu.objects.filter(Menu.parent_id == None),
        }
        if action_id:
            action = Action.objects.get(action_id).get_action()
            action = app['action.action_type'].objects.get(action.id)
            cur_menu = None
            context['current_menu'] = cur_menu
            return jsonify(action)
        return render_template('web/action.html', **context)

    @route('/client/i18n/catalog.js')
    def i18n_js_catalog(self):
        from .i18n import javascript_catalog
        return javascript_catalog(request, packages=[addon.name for addon in app.addons])

    @route('/reports/<path:path>')
    def report(self, path):
        return send_from_directory(settings.REPORT_PATH, path)

    @route('/login/', methods=['GET', 'POST'])
    def login(self):
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            u = auth.authenticate(username=username, password=password)
            if u and u.is_authenticated:
                auth.login(u)
                return redirect(request.args.get('next', url_for('WebClient:index_1')))
            flash(gettext('Invalid username and password.'), 'danger')
        return render_template('web/login.html', settings=settings, _=gettext)

    def logout(self):
        auth.logout()
        return redirect(url_for('WebClient:login'))
