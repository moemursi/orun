import os
from flask import redirect, send_from_directory, session, url_for, flash
from orun.conf import settings
from orun import request
from orun.utils.json import jsonify
from orun.utils.translation import gettext
from orun import app, render_template
from orun.views import BaseView, route, json_route
from orun.auth.decorators import login_required
from orun import app, auth, api


class WebClient(BaseView):
    route_base = '/web/'

    @login_required
    def index(self):
        menu = app['ui.menu']
        #menu_items = menu.search_visible_items()
        main_menu = menu.objects.filter(menu.c.parent_id == None, menu.c.id != 78).first()
        menu_id = main_menu.id
        context = {
            'current_menu': main_menu,
            'root_menu': menu.objects.filter(menu.c.parent_id == None),
            'settings': settings,
        }
        return render_template('web/index.html', **context)

    # @route('/action/<action_id>/')
    # @login_required
    # def action(self, action_id=None):
    #     Action = app['ir.action']
    #     Menu = app['ui.menu']
    #     context = {
    #         'root_menu': Menu.objects.filter(Menu.c.parent_id == None),
    #     }
    #     if action_id:
    #         action = Action.objects.get(action_id).get_action()
    #         cur_menu = None
    #         context['current_menu'] = cur_menu
    #         return jsonify(action.serialize())
    #     return render_template('web/action.html', **context)

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
                return redirect(request.args.get('next', url_for('WebClient:index')))
            flash(gettext('Invalid username and password.'), 'danger')
        return render_template('web/login.html', settings=settings)

    def logout(self):
        auth.logout()
        return redirect(url_for('WebClient:login'))

    @route('/client/templates/')
    def client_templates(self):
        return b'<templates>%s</templates>' % b''.join(
            [b''.join(addon.get_js_templates()) for addon in app.iter_blueprints() if addon.js_templates]
        )

    @route('/content/<int:content_id>/')
    def content(self, content_id=None):
        http = app['ir.http']
        return http.get_attachment(content_id)

    @route('/content/upload/', methods=['POST'])
    def upload_attachment(self):
        Attachment = app['ir.attachment']
        res = []
        for file in request.files.getlist('attachment'):
            obj = Attachment.create(
                name=file.filename,
                model=request.form['model'],
                object_id=request.form['id'],
                file_name=file.filename,
                stored_file_name=file.filename,
                content=file.stream,
                mimetype=file.mimetype,
            )
            res.append({'id': obj.pk, 'name': obj.name})
        return jsonify(res)

    @json_route('/data/reorder/', methods=['POST'])
    def reorder(self, model, ids, field='sequence', offset=0):
        cls = app[model]
        for i, obj in enumerate(cls._search({'pk__in': ids})):
            setattr(obj, field, ids.index(obj.pk) + offset)
            obj.save()
        return {
            'status': 'ok',
            'ok': True,
            'result': True,
        }

# @app.errorhandler(500)
# def error(e):
#     pass
    # return render_template('web/500.html')
