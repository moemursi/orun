from orun import app
from orun.views import BaseView, json_route


class WebData(BaseView):
    route_base = '/web-data/'

    @json_route('/reorder/', methods=['POST'])
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
