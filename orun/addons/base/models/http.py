from orun import app
from orun.db import models


class Http(models.Service):
    def get_attachment(self, attachment_id):
        obj = self.env['ir.attachment'].get(attachment_id)
        return app.response_class(obj.content, content_type=obj.mimetype, headers={'Content-Disposition': 'attachment; filename=' + obj.file_name})

    class Meta:
        name = 'ir.http'
