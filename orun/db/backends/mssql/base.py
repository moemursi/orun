from orun.db.backends.base.base import BaseDatabaseWrapper
from .schema import DatabaseSchemaEditor
from .creation import DatabaseCreation
from .features import DatabaseFeatures
from orun.db.backends.mssql.operations import DatabaseOperations


class DatabaseWrapper(BaseDatabaseWrapper):
    SchemaEditorClass = DatabaseSchemaEditor
    creation_class = DatabaseCreation
    features_class = DatabaseFeatures
    ops_class = DatabaseOperations


