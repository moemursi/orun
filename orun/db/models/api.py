
class Record:
    def __init__(self, instance):
        self._instance = instance

    def __getattr__(self, item):
        return getattr(self._instance, item)

    def __setattr__(self, key, value):
        if key == '_instance':
            object.__setattr__(self, key, value)
        else:
            self._instance._state.cache[key] = value
            setattr(self._instance, key, value)


def depends(*fields):
    def decorator(fn):
        fn._name = 'field_changed'
        fn._decorator = 'depends'
        fn._fields = fields
        return fn
    return decorator


def on_change(*fields):
    def decorator(fn):
        fn._name = 'field_changed'
        fn._decorator = 'field_changed'
        fn._fields = fields
        return fn
    return decorator
