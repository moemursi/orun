import pyodbc
import sqlalchemy.dialects.mssql.base
import sqlalchemy.dialects.mssql.pyodbc


class MSSQLCompiler(sqlalchemy.dialects.mssql.base.MSSQLCompiler):
    def returning_clause(self, *args, **kwargs):
        sql = super(MSSQLCompiler, self).returning_clause(*args, **kwargs)
        return sql + ' INTO @table'

    def visit_insert(self, *args, **kwargs):
        sql = super(MSSQLCompiler, self).visit_insert(*args, **kwargs)
        if self.returning:
            sql = """SET NOCOUNT ON DECLARE @table table (id int) """ + sql + """ SELECT id FROM @table"""
        return sql

    def visit_create_column(self, element, **kwargs):
        print(element)
        return super(MSSQLCompiler, self).visit_column()


class MSDDLCompiler(sqlalchemy.dialects.mssql.base.MSDDLCompiler):
    def get_column_specification(self, column, **kwargs):
        if 'compute' in column.info:
            return '%s AS %s' % (column.name, column.info['compute'])
        return super(MSDDLCompiler, self).get_column_specification(column, **kwargs)


class MSSQLDialect(sqlalchemy.dialects.mssql.pyodbc.dialect):
    statement_compiler = MSSQLCompiler
    ddl_compiler = MSDDLCompiler

    def do_execute(self, cursor, statement, parameters, context=None):
        try:
            return super(MSSQLDialect, self).do_execute(cursor, statement, parameters, context)
        except pyodbc.Error as e:
            if e.args[0] == '01003':
                print(e.args[1])
            else:
                raise
