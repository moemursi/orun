from orun.apps import apps
from orun.db import router
from orun.core.management.commands import loaddata
from .base import Operation


class LoadData(Operation):
    """
    Runs some raw SQL. A reverse SQL statement may be provided.

    Also accepts a list of operations that represent the state change effected
    by this SQL change, in case it's custom column/table creation/deletion.
    """
    noop = ''

    def __init__(self, fixtures, reverse_sql=None, state_operations=None, hints=None):
        self.fixtures = fixtures
        self.reverse_sql = reverse_sql
        self.state_operations = state_operations or []
        self.hints = hints or {}

    def deconstruct(self):
        kwargs = {
            'fixtures': self.fixtures,
        }
        if self.reverse_sql is not None:
            kwargs['reverse_sql'] = self.reverse_sql
        if self.state_operations:
            kwargs['state_operations'] = self.state_operations
        if self.hints:
            kwargs['hints'] = self.hints
        return (
            self.__class__.__name__,
            [],
            kwargs
        )

    @property
    def reversible(self):
        return self.reverse_sql is not None

    def state_forwards(self, app_label, state):
        for state_operation in self.state_operations:
            state_operation.state_forwards(app_label, state)

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        if router.allow_migrate(schema_editor.connection.alias, app_label, **self.hints):
            self._load_data(app_label, schema_editor, self.fixtures)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        if self.reverse_sql is None:
            raise NotImplementedError("You cannot reverse this operation")
        if router.allow_migrate(schema_editor.connection.alias, app_label, **self.hints):
            self._remove_data(schema_editor, self.reverse_sql)

    def describe(self):
        return "Load data operation"

    def _remove_data(self, schema_editor, sql):
        pass

    def _load_data(self, app_label, schema_editor, fixtures):
        app_config = apps.addons[app_label]
        for fixture in fixtures:
            loaddata.load_fixture(app_config, fixture)
