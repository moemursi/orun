#from orun.core.mail import send_mail
from orun.db import models
from orun.utils.translation import gettext_lazy as _
from orun.auth.hashers import check_password

from .partner import Partner


class Group(models.Model):
    name = models.CharField(128, _('nome'), unique=True)
    active = models.BooleanField(default=True, verbose_name=_('Active'), help_text=_('Group is active'))

    class Meta:
        name = 'auth.group'
        verbose_name = _('group')
        verbose_name_plural = _('groups')


class ModelAccess(models.Model):
    name = models.CharField(null=False)
    active = models.BooleanField(default=True)
    model = models.ForeignKey('sys.model', on_delete=models.CASCADE, null=False)
    group = models.ForeignKey('auth.group', on_delete=models.CASCADE, null=False)
    perm_read = models.BooleanField(default=True)
    perm_change = models.BooleanField()
    perm_create = models.BooleanField()
    perm_delete = models.BooleanField()
    perm_full = models.BooleanField()

    class Meta:
        name = 'auth.model.access'


class User(Partner):
    date_joined = models.DateTimeField(_('Date Joined'), auto_now=True)
    username = models.CharField(255, _('Login Name'))
    signature = models.HtmlField(_('Signature'))
    is_active = models.BooleanField(default=True)
    action = models.ForeignKey('sys.action')
    user_company = models.ForeignKey('res.company')
    is_staff = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    groups = models.ManyToManyField(Group, label=_('Groups'))
    companies = models.ManyToManyField('res.company', label=_('Companies'))

    class Meta:
        name = 'auth.user'

    def has_perm(self, perm, obj=None):
        return True

    def has_perms(self, perm_list, obj=None):
        for perm in perm_list:
            if not self.has_perm(perm, obj):
                return False
        return True

    @classmethod
    def authenticate(cls, username, password):
        usr = cls.objects.filter(cls.c.username == username, cls.c.active == True).first()
        if usr and check_password(password, usr.password):
            return usr


class Rule(models.Model):
    name = models.CharField()
    active = models.BooleanField(default=True)
    model = models.ForeignKey('sys.model')
    groups = models.ManyToManyField('auth.group')
    domain = models.TextField()
    can_read = models.BooleanField(default=True)
    can_change = models.BooleanField(default=True)
    can_create = models.BooleanField(default=True)
    can_delete = models.BooleanField(default=True)

    class Meta:
        name = 'auth.rule'


class Export(models.Model):
    name = models.CharField(256)
    model = models.CharField(128, db_index=True)

    class Meta:
        name = 'auth.export'


class ExportField(models.Model):
    export = models.ForeignKey(Export, null=False, on_delete=models.CASCADE)
    name = models.CharField(128)

    class Meta:
        name = 'auth.export.field'
