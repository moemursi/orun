from flask import request
from orun import app
from orun.db import models
from orun.db.models.query import QuerySet
from orun.utils.json import jsonify
from orun.views import BaseView, route


class RPC(BaseView):
    route_base = '/api/'

    @route('/rpc/<service>/<method>/', methods=['GET', 'POST', 'DELETE', 'PUT'])
    def call(self, service, method):
        if not method.startswith('_'):
            kwargs = {}
            for k in request.args.lists():
                if len(k[1]) == 1:
                    kwargs[k[0]] = k[1][0]
                else:
                    kwargs[k[0]] = k[1]
            service = app[service]
            meth = getattr(service, method)
            if getattr(meth, 'exposed', None):
                qs = kwargs
                if request.method == 'POST':
                    kwargs = request.json
                    r = meth(**kwargs)
                else:
                    r = meth(**kwargs)
                if isinstance(r, QuerySet):
                    data = {}
                    if 'count' in qs:
                        data['count'] = service.count(r)
                    data['data'] = r.to_list()
                    r = data
                elif isinstance(r, models.Model):
                    r = r.to_dict()
                return jsonify({'result': r})

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
