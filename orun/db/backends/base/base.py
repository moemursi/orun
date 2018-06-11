import sqlalchemy as sa

from orun.conf import settings
from .schema import BaseDatabaseSchemaEditor


class BaseBackend(object):
    schema_allowed = False
    SchemaEditorClass = BaseDatabaseSchemaEditor

    @classmethod
    def create_engine(cls, db, url, **kwargs):
        eng = sa.create_engine(str(url), echo=settings.SQL_DEBUG, **kwargs)
        eng.backend = cls
        return eng
