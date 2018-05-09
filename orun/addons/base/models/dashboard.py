from orun.db import models, session
from orun.utils.translation import gettext_lazy as _
from orun import api


class Category(models.Model):
    name = models.CharField(label=_('Name'), translate=True)

    class Meta:
        title_field = 'name'
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
        return self.objects.filter({'category': category, 'name': name}).one()

    @api.method
    def read(self, id, with_desc=False, **kwargs):
        q = session.execute(self.objects.get(id).sql)
        desc = q.cursor.description
        if with_desc:
            fields = [{'field': f[0], 'type': f[1], 'size': f[2]} for f in desc]
        else:
            fields = [f[0] for f in desc]

        return {
            'fields': fields,
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
