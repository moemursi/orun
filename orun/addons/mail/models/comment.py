from sqlalchemy.orm import foreign, remote
from sqlalchemy.sql import and_
from orun.db import models
from orun import g, api


class Comments(models.Model):
    message_followers = models.OneToManyField(
       'mail.followers', 'object_id',
        editable=False,
        primary_join=lambda model, fk_model: and_(model._meta.pk.column == foreign(fk_model._meta.fields_dict['object_id'].column), fk_model._meta.fields_dict['model_name'].column == model._meta.name),
    )
    messages = models.OneToManyField(
       'mail.message', 'object_id',
        editable=False,
        primary_join=lambda model, fk_model: and_(model._meta.pk.column == foreign(fk_model._meta.fields_dict['object_id'].column), fk_model._meta.fields_dict['model_name'].column == model._meta.name),
    )

    @api.method
    def post_message(self, ids, content=None, **kwargs):
        Message = self.env['mail.message']
        for id in ids:
            yield Message.create(
                author=g.user_id,
                content=content,
                model_name=self._meta.name,
                object_id=id,
                message_type='comment',
                attachments=kwargs.get('attachments'),
            )

    class Meta:
        abstract = True
        name = 'mail.comments'
