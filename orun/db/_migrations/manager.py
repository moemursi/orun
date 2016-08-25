

class MigrationManager(object):
    def __init__(self):
        self.migrations = []
        self.tables = {}
        self.ordered_migrations = []

    def add_migration(self, migration):
        pass

    def __iter__(self):
        return iter(self.migrations)
