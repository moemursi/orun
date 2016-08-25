from collections import namedtuple

from orun.db.backends.base.introspection import (
    BaseDatabaseIntrospection, FieldInfo, TableInfo,
)
from orun.utils.encoding import force_text


class DatabaseIntrospection(BaseDatabaseIntrospection):
    def get_table_list(self, cursor):
        """Return a list of table and view names in the current database."""
        cursor.execute("""SELECT TABLE_NAME, 't'
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            UNION
            SELECT TABLE_NAME, 'v'
            FROM INFORMATION_SCHEMA.VIEWS
        """)
        return [TableInfo(r[0], r[1]) for r in cursor.fetchall()]
