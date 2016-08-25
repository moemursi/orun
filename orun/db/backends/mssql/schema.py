from orun.db.backends.base.schema import BaseDatabaseSchemaEditor


class DatabaseSchemaEditor(BaseDatabaseSchemaEditor):
    sql_create_column = "ALTER TABLE %(table)s ADD %(column)s %(definition)s"
    sql_alter_table = "ALTER TABLE %(table)s ADD %(definition)s"
    sql_alter_table_add_column = "%(column)s"
