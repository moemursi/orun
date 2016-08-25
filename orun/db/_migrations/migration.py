import os
from orun.db.fixture import Fixture


class Migration(object):
    dependencies = []
    run_before = []
    pre_migrate = []
    operations = []
    post_migrate = []
    run_after = []

    # Migration names in this app that this migration replaces. If this is
    # non-empty, this migration will only be applied if all these migrations
    # are not applied.
    replaces = []

    fixtures = []
    new_version = None
    name = None

    # Is this an initial migration? Initial migrations are skipped on
    # --fake-initial if the table or fields already exist. If None, check if
    # the migration has any dependencies to determine if there are dependencies
    # to tell if db introspection needs to be done. If True, always perform
    # introspection. If False, never perform introspection.
    initial = None

    def __init__(self, name, app_label, schema_editor=None, state=None, current_version=None):
        self.name = name
        self.app_label = app_label
        self.current_version = current_version
        #self.schema_editor = schema_editor
        self.state = state

    @property
    def app_config(self):
        from orun.apps import apps
        return apps.addons[self.app_label]

    def mutate_state(self, project_state, preserve=True):
        """
        Takes a ProjectState and returns a new one with the migration's
        operations applied to it. Preserves the original object state by
        default and will return a mutated state from a copy.
        """
        new_state = project_state
        if preserve:
            new_state = project_state.clone()

        for operation in self.operations:
            operation.state_forwards(self.app_label, new_state)
        return new_state


    def run(self):
        self.before()
        if self.state == 'install':
            self.install()
        elif self.state == 'update':
            self.update()
        self.migrate()
        self.after()

    def install(self):
        pass

    def update(self):
        pass

    def migrate(self):
        for op in self.operations:
            op.apply(self)

    def before(self):
        for op in self.run_before:
            op.apply(self)

    def after(self):
        for op in self.run_after:
            op.apply(self)

    def apply(self):
        self.run()

    def unapply(self):
        for op in self.operations:
            if op.reversible:
                op.unapply(self)

    def load_fixture(self, fixture):
        fixture.load(self)

    def load_fixtures(self):
        for fixture in self.fixtures:
            self.load_fixture(Fixture(os.path.join(self.app_config.root_path, 'fixtures', fixture)))
