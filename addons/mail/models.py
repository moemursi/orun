from orun.db import models


class Thread(models.Model):

    class Meta:
        abstract = True
        name = 'mail.thread'
