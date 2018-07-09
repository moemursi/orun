from orun.db.backends.base.schema import BaseDatabaseSchemaEditor


class DatabaseSchemaEditor(BaseDatabaseSchemaEditor):
    sql_create_column = "ALTER TABLE %(table)s ADD %(column)s %(definition)s"
    sql_alter_column_type = "ALTER COLUMN %(column)s %(type)s"
    sql_alter_table = "ALTER TABLE %(table)s ADD %(definition)s"
    sql_alter_table_add_column = "%(column)s"
    sql_alter_column_null = "ALTER COLUMN %(column)s %(definition)s NOT NULL"
    sql_alter_column_not_null = "ALTER COLUMN %(column)s %(definition)s NULL"
    sql_set_sequence_max = "DBCC CHECKIDENT ('%(table)s')"
    sql_rename_table = "SP_RENAME '%(old_table)s', '%(new_table)s'"
    sql_rename_column = "SP_RENAME '%(table)s.%(old_column)s', %(new_column)s, 'COLUMN'"
    sql_delete_column = "ALTER TABLE %(table)s DROP COLUMN %(column)s"
    sql_delete_table = "DROP TABLE %(table)s"

    def _create_fk_sql(self, model, field, suffix):
        sql = super(DatabaseSchemaEditor, self)._create_fk_sql(model, field, suffix)
        return sql
