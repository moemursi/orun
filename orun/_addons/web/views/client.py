from orun.shortcuts import render
from orun.conf import settings
from orun.utils.translation import gettext
from orun.http import HttpResponse, HttpRequest, JsonResponse, HttpResponseRedirect
from orun.contrib import messages
from orun.auth.decorators import login_required
from orun import auth
from orun.apps import apps

View = apps['ui.view']


@login_required
def index(request: HttpRequest):
    menu = apps['ui.menu']
    menu_items = menu.search_visible_items(request)
    menu_id = menu_items[0]
    context = {
        'current_menu': menu_id,
        'root_menu': menu_items,
    }
    if settings.USE_I18N:
        from .i18n import javascript_catalog
        context['i18n_js_catalog'] = javascript_catalog(request, packages=apps.addons.keys())
    return render(request, '/web/index.jinja2', context)


def company_logo(request):
    return HttpResponseRedirect('/static/web/assets/img/katrid-logo.png')
    if request.user.is_authenticated:
        company = request.user.user_company
        if company and company.image:
            return HttpResponseRedirect(f'/web/content/{company.image.decode("utf-8")}/?download')
    return HttpResponseRedirect('/static/web/assets/img/katrid-logo.png')


def login(request: HttpRequest):
    if request.method == 'POST':
        if request.is_json():
            data = request.json
        else:
            data = request.POST
        username = data['username']
        password = data['password']
        # check if db exists
        u = auth.authenticate(username=username, password=password)
        if u and u.is_authenticated:
            auth.login(request, u)
            if request.is_json():
                return JsonResponse({
                    'ok': True,
                    'user_id': u.id,
                    'redirect': request.GET.get('next', '/web/'),
                    'message': gettext('Login successful, please wait...'),
                })
            return HttpResponseRedirect(request.GET.get('next', '/web/'))
        if request.is_json():
            return JsonResponse({
                'error': True,
                'message': gettext('Invalid username and password.'),
            })
        messages.error(request, gettext('Invalid username and password.'))

    from .i18n import javascript_catalog
    context = {
        'i18n_js_catalog': javascript_catalog(request, packages=apps.addons.keys())
    }
    return render(request, 'web/login.jinja2', context, using=request.COOKIES.get('db'))


@login_required
def logout(request):
    auth.logout(request)
    return HttpResponseRedirect('/web/login/')


@login_required
def js_templates(self):
    return HttpResponse(
        b'<templates>%s</templates>' % b''.join(
            [b''.join(addon.get_js_templates()) for addon in apps.addons.values() if addon.js_templates]
        )
    )


@login_required
def content(self, content_id=None):
    http = apps['ir.http']
    return http.get_attachment(content_id)


@login_required
def upload_attachment(request):
    Attachment = apps['ir.attachment']
    res = []
    for file in request.FILES.getlist('attachment'):
        obj = Attachment.objects.create(
            name=file.name,
            model=request.POST['model'],
            object_id=request.POST['id'],
            file_name=file.name,
            stored_file_name=file.name,
            content=file.file.read(),
            mimetype=file.content_type,
        )
        res.append({'id': obj.pk, 'name': obj.name})
    return JsonResponse({'result': res})


@login_required
def upload_file(request, model, meth):
    model = apps[model]
    meth = getattr(model, meth)
    if meth.exposed:
        res = meth([file for file in request.files.getlist('files')], **request.form)
        if isinstance(res, dict):
            res = JsonResponse(res)
        return res


@login_required
def reorder(request, model, ids, field='sequence', offset=0):
    cls = apps[model]
    for i, obj in enumerate(cls._search({'pk__in': ids})):
        setattr(obj, field, ids.index(obj.pk) + offset)
        obj.save()
    return {
        'status': 'ok',
        'ok': True,
        'result': True,
    }


@login_required
def image(request, model, field, id):
    return HttpResponseRedirect(apps['ir.attachment'].objects.filter(id=id).one().get_download_url())


# @login_required
# def query(request):
#     id = request.args.get('id')
#     queries = apps['ir.query']
#     query = None
#     if id:
#         query = queries.read(id, return_cursor=True)
#     queries = queries.objects.all()
#     cats = defaultdict(list)
#     for q in queries:
#         cats[q.category].append(q)
#     return render_template('/web/query.html', categories=cats, query=query)

