from orun.db import models
from orun import api


class Comments:

    @api.method
    def post_message(self, id, content=None, **kwargs):
        print(id, content)
        return {}
