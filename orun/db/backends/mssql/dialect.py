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


class MSSQLDialect(sqlalchemy.dialects.mssql.pyodbc.dialect):
    statement_compiler = MSSQLCompiler
