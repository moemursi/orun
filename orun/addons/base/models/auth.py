from orun.core.mail import send_mail
from orun.db import models
from orun.utils.translation import gettext_lazy as _

from .partner import Partner


class Permission(models.Model):
    name = models.CharField(null=False)
    model = models.ForeignKey('sys.model', on_delete=models.CASCADE, null=False)
    codename = models.CharField(32, _('codename'), null=False)

    class Meta:
        name = 'auth.permission'
        unique_together = (('model', 'codename'),)


class Group(models.Model):
    name = models.CharField(128, _('name'), unique=True)
    permissions = models.ManyToManyField(Permission, verbose_name=_('permissions'))

    class Meta:
        name = 'auth.group'
        verbose_name = _('group')
        verbose_name_plural = _('groups')


class User(Partner):
    date_joined = models.DateTimeField(_('Date Joined'))
    username = models.CharField(255, _('Login Name'))
    password = models.CharField(255, _('password'))
    signature = models.HtmlField(_('signature'))
    is_active = models.BooleanField(default=True)
    action = models.ForeignKey('sys.action')
    user_company = models.ForeignKey('res.company')
    is_staff = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    groups = models.ManyToManyField(Group)
    companies = models.ManyToManyField('res.company')

    class Meta:
        name = 'auth.user'

    def has_perm(self, perm, obj=None):
        return True

    def has_perms(self, perm_list, obj=None):
        for perm in perm_list:
            if not self.has_perm(perm, obj):
                return False
        return True

    def email_user(self, subject, message, from_email=None, **kwargs):
        """
        Sends an email to this User.
        """
        send_mail(subject, message, from_email, [self.email], **kwargs)
