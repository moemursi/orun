from flask import request
from orun import app
from orun.db import models, transaction
from orun.db.models.query import Query
from orun.utils.json import jsonify
from orun.views import BaseView, route


class RPC(BaseView):
    route_base = '/api/'

    @route('/rpc/<service>/<method>/', methods=['GET', 'POST', 'DELETE', 'PUT'])
    @transaction.atomic
    def call(self, service, method):
        if not method.startswith('_'):
            kwargs = {}
            args = ()
            for k in request.args.lists():
                if k[0].startswith('_'):
                    continue
                if k[0] == 'args':
                    args = k[1]
                elif len(k[1]) == 1:
                    kwargs[k[0]] = k[1][0]
                else:
                    kwargs[k[0]] = k[1]
            service = app[service]
            meth = getattr(service, method)
            if getattr(meth, 'exposed', None):
                qs = kwargs
                if request.method == 'POST':
                    if request.data:
                        kwargs = request.json.get('kwargs', {})
                        args = request.json.get('args', [])
                    else:
                        kwargs = {}
                        args = []
                    r = meth(*args, **kwargs)
                else:
                    print(args, kwargs)
                    r = meth(*args, **kwargs)
                if isinstance(r, Query):
                    r = {
                        'data': r,
                        'count': getattr(r, '_count__cache', None),
                    }
                elif isinstance(r, models.Model):
                    r = {
                        'data': [r]
                    }
                res = {
                    'status': 'ok',
                    'ok': True,
                    'result': r,
                }
                return jsonify(res)

    @route('/field/choices/<service>/<field>/', methods=['GET'])
    def choices(self, service, field):
        service = app[service]
        field = service._meta.get_field(field)
        service = app[field.related_model._meta.name]
        r = service.search_name(name=request.args.get('q'))
        return jsonify({'result': r})

    @route('/app/settings/', methods=['GET'])
    def app_settings(self):
        return jsonify({'result': {}})


class Auth(BaseView):
    route_base = '/api/auth/'
