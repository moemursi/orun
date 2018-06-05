from orun.db.backends.base.base import BaseBackend
from .schema import DatabaseSchemaEditor


class Backend(BaseBackend):
    schema_allowed = True
    SchemaEditorClass = DatabaseSchemaEditor
