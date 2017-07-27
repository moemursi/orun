from sqlalchemy.orm import foreign, remote
from sqlalchemy.sql import and_
from orun import app, env
from orun.db import models
from orun import api


class Comments(models.Model):
    message_followers = models.OneToManyField(
       'mail.followers', 'object_id',
        primary_join=lambda model, fk_model: and_(model._meta.pk.column == foreign(fk_model._meta.fields_dict['object_id'].column), fk_model._meta.fields_dict['model_name'].column == model._meta.name),
    )
    messages = models.OneToManyField(
       'mail.message', 'object_id',
        primary_join=lambda model, fk_model: and_(model._meta.pk.column == foreign(fk_model._meta.fields_dict['object_id'].column), fk_model._meta.fields_dict['model_name'].column == model._meta.name),
    )

    @api.method
    def post_message(cls, ids, content=None, **kwargs):
        Message = app['mail.message']
        r = []
        for id in ids:
            msg = Message.create(
                author=env.user.pk,
                content=content,
                model_name=cls._meta.name,
                object_id=id,
                message_type='comment',
            )
            r.append(msg)
        return r

    class Meta:
        abstract = True
        name = 'mail.comments'
