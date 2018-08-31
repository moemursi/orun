from collections import defaultdict

from flask import redirect, send_from_directory, url_for, flash

from orun import app, auth, g
from orun import render_template
from orun import request
from orun.auth.decorators import login_required
from orun.conf import settings
from orun.utils.json import jsonify
from orun.utils.translation import gettext
from orun.views import BaseView, route, json_route


class WebClient(BaseView):
    route_base = '/web/'

    @login_required
    def index(self):
        menu = app['ui.menu']
        menu_items = menu.search_visible_items()
        menu_id = menu_items[0]
        context = {
            'current_menu': menu_id,
            'root_menu': menu_items,
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

    @route('/company/logo/')
    def company_logo(self):
        company = app['auth.user'].objects.get(g.user_id).user_company
        if company and company.image:
            return redirect(f'/web/content/{company.image.decode("utf-8")}/?download')
        return redirect('/static/web/assets/img/katrid-logo.png')

    @route('/reports/<path:path>')
    def report(self, path):
        return send_from_directory(settings.REPORT_PATH, path)

    @route('/login/', methods=['GET', 'POST'])
    def login(self):
        if request.method == 'POST':
            if request.is_json:
                username = request.json['username']
                password = request.json['password']
            else:
                username = request.form['username']
                password = request.form['password']
            u = auth.authenticate(username=username, password=password)
            if u and u.is_authenticated:
                auth.login(u)
                if request.is_json:
                    return jsonify({
                        'success': True,
                        'user_id': u.id,
                        'redirect': request.args.get('next', url_for('WebClient:index'))
                    })
                return redirect(request.args.get('next', url_for('WebClient:index')))
            if request.is_json:
                return jsonify({
                    'success': False,
                    'message': gettext('Invalid username and password.'),
                })
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

    @route('/file/upload/<model>/<meth>/', methods=['POST'])
    def upload_file(self, model, meth):
        model = app[model]
        meth = getattr(model, meth)
        if meth.exposed:
            return meth([file for file in request.files.getlist('files')])

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

    @route('/image/<model>/<field>/<id>/')
    def image(self, model, field, id):
        return redirect(app['ir.attachment'].objects.filter(id=id).one().get_download_url())

    @route('/query/')
    def query(self):
        id = request.args.get('id')
        queries = app['ir.query']
        query = None
        if id:
            query = queries.read(id, return_cursor=True)
        queries = queries.objects.all()
        cats = defaultdict(list)
        for q in queries:
            cats[q.category].append(q)
        return render_template('/web/query.html', categories=cats, query=query)


# @app.errorhandler(500)
# def error(e):
#     pass
    # return render_template('web/500.html')
