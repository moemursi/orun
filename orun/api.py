from collections import Mapping
import inspect
from functools import wraps

from orun import app, request
from orun.core.exceptions import RPCError
from orun.utils.functional import SimpleLazyObject


class RecordsProxy(object):
    def __init__(self, model, iterable, env=None):
        self.__dict__['env'] = env
        self.__dict__['__model__'] = model
        self.__dict__['__instance__'] = iterable

    def __iter__(self):
        return iter(self.__instance__)

    def __getitem__(self, item):
        return self.__instance__[item]

    def __setitem__(self, key, value):
        self.__instance__[key] = value

    def __getattr__(self, item):
        return getattr(self.__instance__, item)

    def __setattr__(self, key, value):
        setattr(self.__instance__, key, value)

    def __call__(self, *args, **kwargs):
        return self.__instance__.__call__(self.env, *args, **kwargs)


class Environment(Mapping):
    def __init__(self, user_id, context):
        self.user_id = user_id
        self.context = context

    def __getitem__(self, item):
        if inspect.isclass(item):
            item = item._meta.name
        model = app.models[item]
        return model.__new__(model)

    def __iter__(self):
        return app.models

    def __call__(self, user_id=None, context=None):
        ctx = self.context.copy()
        ctx.update(context or {})
        return self.__class__(user_id, ctx)

    def __len__(self):
        return len(app.models)

    @property
    def user(self):
        return SimpleLazyObject(lambda: self['auth.user'].objects.get(self.user_id))


def method(*args, public=False, methods=None):
    def decorator(fn):
        fn.exposed = True
        fn.public = public
        fn.methods = methods
        return fn
    if args and callable(args[0]):
        return decorator(args[0])
    return decorator


def records(*args, **kwargs):
    from orun.db import models

    def decorator(fn):
        fn.exposed = True

        @wraps(fn)
        def wrapped(self, *args, **kwargs):
            ids = None
            if args:
                args = list(args)
                ids = args[0]
                args = args[1:]
            if not ids and not issubclass(self, models.Model):
                ids = (self,)
            elif ids:
                ids = self.objects.filter(self.c.pk.in_(kwargs.pop('ids', ids)))
            if not isinstance(ids, RecordsProxy):
                ids = RecordsProxy(self,  ids)
            return fn(ids, *args, **kwargs)
        return wrapped

    if args and callable(args[0]):
        return decorator(args[0])
    return decorator


def depends(fields):
    def decorator(fn):
        fn.depends = fields
        return fn
    return decorator


def onchange(fields):
    def decorator(fn):
        fn.depends = fields
        return fn
    return decorator


def serialize(*args, **kwargs):
    def decorator(fn):
        fn.exposed = True

        @wraps(fn)
        def wrapped(*args, **kwargs):
            r = fn(*args, **kwargs)
            if r:
                r.__serialize__ = True
            return r
        return wrapped

    if args and callable(args[0]):
        return decorator(args[0])
    return decorator


def jsonrpc(fn):

    @wraps(fn)
    def wrapped(*args, **kwargs):
        from orun.utils.json import jsonify
        data = request.json
        _id = data['id']
        kwargs['params'] = data.get('params')
        try:
            r = fn(*args, **kwargs)
            return jsonify({
                'jsonrpc': '2.0',
                'id': _id,
                'result': r
            })
        except RPCError as e:
            return jsonify({
                'jsonrpc': '2.0',
                'id': _id,
                'error': {
                    'code': e.code,
                    'message': str(e)
                }
            })

    return wrapped
