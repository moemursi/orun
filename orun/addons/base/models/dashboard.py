from orun.db import models, session
from orun.utils.translation import gettext_lazy as _
from orun import api


class Category(models.Model):
    name = models.CharField(label=_('Name'), translate=True)

    class Meta:
        name = 'ir.query.category'


class Query(models.Model):
    name = models.CharField(label=_('Name'), translate=True)
    category = models.ForeignKey(Category, null=False)
    sql = models.TextField()
    params = models.TextField()

    class Meta:
        name = 'ir.query'

    @api.method
    def read(self, id, **kwargs):
        q = session.execute(self.objects.get(id).sql)
        desc = q.cursor.description
        return {
            'fields': [f[0] for f in desc],
            'data': [list(row) for row in q],
        }


class DashboardSettings(models.Model):
    """
    Dashboard settings.
    """
    dashboard = models.ForeignKey('ir.action.client')
    content = models.TextField(label='Content')

    class Meta:
        title_field = 'dashboard'
        name = 'ir.dashboard.settings'
