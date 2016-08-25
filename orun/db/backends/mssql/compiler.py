from orun.db.models.sql import compiler


class SQLCompiler(compiler.SQLCompiler):
    def as_sql(self, with_limits=True, with_col_aliases=False, subquery=False):
        sql, params = super(SQLCompiler, self).as_sql(
            with_limits=False,
            with_col_aliases=with_col_aliases,
            subquery=subquery,
        )
        if with_limits:
            offset = self.query.low_mark or 0
            limit = (self.query.high_mark or 0) - offset
            if limit:
                sql += ' OFFSET %d ROWS FETCH NEXT %d ROWS ONLY' % (offset, limit)
        return sql, params


class SQLInsertCompiler(compiler.SQLInsertCompiler, SQLCompiler):
    pass


class SQLDeleteCompiler(compiler.SQLDeleteCompiler, SQLCompiler):
    pass


class SQLUpdateCompiler(compiler.SQLUpdateCompiler, SQLCompiler):
    pass


class SQLAggregateCompiler(compiler.SQLAggregateCompiler, SQLCompiler):
    pass
