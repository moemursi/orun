from base import models as base
from orun.db import models


class Partner(base.Partner):
    test = models.CharField(max_length=128)
