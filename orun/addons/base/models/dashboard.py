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
    public = models.BooleanField(default=False)

    class Meta:
        name = 'ir.query'

    def get_by_natural_key(self, category, name):
        cat = self.env['ir.query.category'].get_by_natural_key(category).only('pk').one()
        return self.objects.filter({'category': cat.pk, 'name': name}).one()

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
