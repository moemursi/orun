import sys

from orun.db.backends.base.creation import BaseDatabaseCreation


class DatabaseCreation(BaseDatabaseCreation):

    def sql_table_creation_suffix(self):
        test_settings = self.connection.settings_dict['TEST']
        return ''

    def _clone_test_db(self, number, verbosity, keepdb=False):
        self.connection.close()

        qn = self.connection.ops.quote_name
        source_database_name = self.connection.settings_dict['NAME']
        target_database_name = self.get_test_db_clone_settings(number)['NAME']

        with self._nodb_connection.cursor() as cursor:
            try:
                cursor.execute("CREATE DATABASE %s WITH TEMPLATE %s" % (
                    qn(target_database_name), qn(source_database_name)))
            except Exception as e:
                if keepdb:
                    return
                try:
                    if verbosity >= 1:
                        print("Destroying old test database for alias %s..." % (
                            self._get_database_display_str(verbosity, target_database_name),
                        ))
                    cursor.execute("DROP DATABASE %s" % qn(target_database_name))
                    cursor.execute("CREATE DATABASE %s WITH TEMPLATE %s" % (
                        qn(target_database_name), qn(source_database_name)))
                except Exception as e:
                    sys.stderr.write("Got an error cloning the test database: %s\n" % e)
                    sys.exit(2)
