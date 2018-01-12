import datetime
from orun.db import models
from orun.utils.translation import gettext_lazy as _
from orun import api


class Subtype(models.Model):
    name = models.CharField(128)
    sequence = models.IntegerField()
    description = models.TextField()
    internal = models.BooleanField(default=True)
    parent = models.ForeignKey('self')
    rel_field = models.CharField(128)
    model_name = models.CharField(128)
    default = models.BooleanField(default=True)

    class Meta:
        name = 'mail.message.subtype'


class Message(models.Model):
    subject = models.CharField()
    date_time = models.DateTimeField(default=datetime.datetime.now)
    content = models.HtmlField()
    parent = models.ForeignKey('self')
    model_name = models.CharField(128)
    object_id = models.BigIntegerField()
    object_name = models.CharField()
    message_type = models.SelectionField(
        (
            ('email', _('Email')),
            ('comment', _('Comment')),
            ('notification', _('Notification')),
        ),
        default='email', null=False,
    )
    subtype = models.ForeignKey(Subtype, db_index=True)
    email_from = models.EmailField()
    author = models.ForeignKey('res.partner', db_index=True)
    partners = models.ManyToManyField('res.partner')
    need_action_partners = models.ManyToManyField('res.partner')
    channels = models.ManyToManyField('mail.channel')
    notifications = models.OneToManyField('mail.notification', 'mail_message')
    message_id = models.CharField('Message-Id')
    reply_to = models.CharField('Reply-To')
    mail_server = models.ForeignKey('ir.mail.server')
    attachments =  models.ManyToManyField('ir.attachment')

    class Meta:
        name = 'mail.message'
        ordering = '-pk'
        index_together = (('model_name', 'object_id'),)

    @api.records
    def get_messages(self, *args, **kwargs):
        for r in self:
            yield {
                'id': r.pk,
                'content': r.content,
                'email_from': r.email_from,
                'author': r.author,
                'date_time': r.date_time,
                'message_type': r.message_type,
                'object_id': r.object_id,
                'object_name': r.object_name,
            }
