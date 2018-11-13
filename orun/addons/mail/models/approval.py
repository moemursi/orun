from orun import app, g
from orun.utils.translation import gettext_lazy as _, gettext
from orun.db import models
from orun.core.exceptions import ValidationError


class DocumentApproval(models.Model):
    """
    Model for documents with approval levels.
    """
    current_approval_level = models.ForeignKey('mail.approval.level')

    def can_approve_document_level(self, user, level):
        return True

    def approve_document_level(self, level=None):
        if level is None:
            level = self.next_approval_level
        if g.user and not g.user.is_superuser:
            l = level or self.current_approval_level
            if l.permission == 'user' and l.user_id != g.user_id:
                raise ValidationError(gettext('Permission denied'))
        if level is None or self.current_approval_level_id == level.pk:
            setattr(self, self._meta.status_field, self.current_approval_level.next_level)
        else:
            self.current_approval_level = level
            setattr(self, self._meta.status_field, level.level)

    def get_document_level_field_value(self):
        return getattr(self, self._meta.status_field)

    def evaluate_auto_approval_level(self):
        # there's no approval level
        next_level = self.next_approval_level
        if self.current_approval_level is None:
            next_level = self.next_approval_level
            if next_level is None:
                return
            self.current_approval_level = next_level
            self.save()
        elif next_level:
            level = app['mail.approval.level'].objects.filter(id=next_level.pk, permission='allow').first()
            if level is not None:
                self.current_approval_level = level
                setattr(self, self._meta.status_field, level.next_level or level.level)
                self.save()

    @property
    def next_approval_level(self):
        current_level = self.current_approval_level
        if current_level is None:
            level = getattr(self, self._meta.status_field, None)
            objs = app['mail.approval.level'].objects.filter(
                approval_model__model__name=self._meta.name, approval_model__active=True
            )
            if level:
                obj = objs.filter(level=level).first()
                return obj
            return objs.first()
        else:
            Level = app['mail.approval.level']
            return Level.objects.filter(
                Level.c.sequence > self.current_approval_level.sequence,
                approval_model=self.current_approval_level.approval_model,
            ).first()

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.evaluate_auto_approval_level()


class ApprovalModel(models.Model):
    name = models.CharField(null=False)
    model = models.ForeignKey('ir.model', null=False)
    active = models.BooleanField(default=True)
    levels = models.OneToManyField('mail.approval.level')

    class Meta:
        name = 'mail.approval.model'


class ApprovalLevel(models.Model):
    PERMISSION = (
        ('allow', _('Allowed')),
        ('user', _('User')),
        ('group', _('Group')),
    )
    approval_model = models.ForeignKey(ApprovalModel, null=False)
    sequence = models.IntegerField()
    level = models.CharField()
    next_level = models.CharField()
    permission = models.SelectionField(PERMISSION)
    user = models.ForeignKey('auth.user')
    group = models.ForeignKey('auth.group')
    sql_criteria = models.TextField(label='Custom Criteria', template={'form': 'view.form.code-editor.pug'})

    class Meta:
        name = 'mail.approval.level'
        ordering = 'sequence'

    def __str__(self):
        return self.level


class ApprovalHistory(models.Model):
    pass

