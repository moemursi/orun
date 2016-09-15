from orun.db import models
from orun.utils.translation import gettext_lazy as _

from .partner import Partner


class UserCompany(models.Model):
    user = models.ForeignKey('auth.user')
    company = models.ForeignKey('res.company')

    class Meta:
        name = 'auth.user.company'


class Company(Partner):
    parent = models.ForeignKey('self')
    currency = models.ForeignKey('res.currency')
    report_header = models.TextField()
    report_footer = models.TextField()
    report_paper = models.CharField(32, choices=(
        ('A4', 'A4'),
        ('LETTER', 'Letter'),
    ), default='A4')
    #users = models.ManyToManyField('auth.user', through=UserCompany)

    class Meta:
        name = 'res.company'
        verbose_name = _('Company')
        verbose_name_plural = _('Companies')
