from functools import wraps


def method(*args, public=False, methods=None):
    def decorator(fn):
        fn.exposed = True
        fn = classmethod(fn)
        fn.exposed = True
        fn.public = public
        fn.methods = methods
        return fn
    if args and callable(args[0]):
        return decorator(args[0])
    return decorator


def depends(fields):
    def decorator(fn):
        fn.depends = fields
        return fn
    return decorator
