from orun.db.backends.base.base import BaseBackend
from .schema import DatabaseSchemaEditor


class Backend(BaseBackend):
    schemas_allowed = True
    SchemaEditorClass = DatabaseSchemaEditor
