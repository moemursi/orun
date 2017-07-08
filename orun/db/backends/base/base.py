import sqlalchemy as sa

from orun.conf import settings
from .schema import BaseDatabaseSchemaEditor


class BaseBackend(object):
    schemas_allowed = False
    SchemaEditorClass = BaseDatabaseSchemaEditor

    @classmethod
    def create_engine(cls, db, url):
        return sa.create_engine(str(url), echo=settings.DEBUG)
