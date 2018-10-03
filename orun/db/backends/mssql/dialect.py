import sqlalchemy.dialects.mssql.base
import sqlalchemy.dialects.mssql.pyodbc


class MSSQLCompiler(sqlalchemy.dialects.mssql.base.MSSQLCompiler):
    def returning_clause(self, *args, **kwargs):
        sql = super(MSSQLCompiler, self).returning_clause(*args, **kwargs)
        return sql + ' INTO @table'

    def visit_insert(self, *args, **kwargs):
        sql = super(MSSQLCompiler, self).visit_insert(*args, **kwargs)
        if self.returning:
            sql = """SET ANSI_WARNINGS OFF SET NOCOUNT ON DECLARE @table table (id int) """ + sql + """ SELECT id FROM @table"""
        return sql


class MSDDLCompiler(sqlalchemy.dialects.mssql.base.MSDDLCompiler):
    def get_column_specification(self, column, **kwargs):
        if 'compute' in column.info:
            return '%s AS %s' % (column.name, column.info['compute'])
        return super(MSDDLCompiler, self).get_column_specification(column, **kwargs)


class MSSQLDialect(sqlalchemy.dialects.mssql.pyodbc.dialect):
    statement_compiler = MSSQLCompiler
    ddl_compiler = MSDDLCompiler

    @sqlalchemy.dialects.mssql.base._db_plus_owner
    def get_foreign_keys(self, connection, tablename, dbname, owner, schema, **kw):
        if schema:
            tablename = schema + '.' + tablename
        sql = '''select fk.name constraint_name, cols.name as column_name, schemas.name as schema_name, rt.name as table_name, cols2.name as referred_name
from sys.foreign_keys fk
inner join sys.tables rt on fk.referenced_object_id = rt.object_id
inner join sys.foreign_key_columns fkc on fkc.constraint_object_id = fk.object_id
inner join sys.columns cols on cols.object_id = fk.parent_object_id and cols.column_id = fkc.parent_column_id
inner join sys.columns cols2 on cols2.object_id = fkc.referenced_object_id and cols2.column_id = fkc.referenced_column_id
inner join sys.schemas schemas on schemas.schema_id = rt.schema_id
where fk.parent_object_id = OBJECT_ID('%s')
''' % tablename
        for fk in connection.execute(sql).fetchall():
            yield {
                'name': fk.constraint_name,
                'constrained_columns': [fk.column_name],
                'referred_schema': fk.schema_name,
                'referred_table': fk.table_name,
                'referred_columns': [fk.referred_name]
            }
