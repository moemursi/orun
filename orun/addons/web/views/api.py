import json
from flask import request
from orun import app
from orun.db import models
from orun.db.models.query import QuerySet
from orun.views import BaseView, route


class Rpc(BaseView):
    route_base = '/api/'

    @route('/rpc/call/<service>/<method>/')
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
                r = meth(**kwargs)
                if isinstance(r, QuerySet):
                    r = r.to_list()
                if isinstance(r, models.Model):
                    r = r.to_dict()
                if isinstance(r, (list, dict)):
                    r = json.dumps(r)
                return r


class Data(BaseView):
    route_base = '/data/'

    @route('/data/<model>/')
    def list(self, model):
        pass

    @route('/data/<model>/<id>/')
    def get(self, model, id):
        pass

    @route('/data/<model>/<id>/')
    def post(self, model, id):
        pass

    @route('/data/<model>/<id>/')
    def delete(self, model, id):
        pass
