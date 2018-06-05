import sqlalchemy as sa

from orun.conf import settings
from .schema import BaseDatabaseSchemaEditor


class BaseBackend(object):
    schema_allowed = False
    SchemaEditorClass = BaseDatabaseSchemaEditor

    @classmethod
    def create_engine(cls, db, url):
        eng = sa.create_engine(str(url), echo=settings.SQL_DEBUG)
        eng.backend = cls
        return eng
