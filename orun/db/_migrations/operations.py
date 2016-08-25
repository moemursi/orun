from orun.utils.functional import cached_property
from orun.db.migrations.state import ModelState


class Operation(object):
    serialization_expand_args = []
    elidable = False

    def __new__(cls, *args, **kwargs):
        # We capture the arguments to make returning them trivial
        self = object.__new__(cls)
        self._constructor_args = (args, kwargs)
        return self

    def deconstruct(self):
        """
        Returns a 3-tuple of class import path (or just name if it lives
        under orun.db.migrations), positional arguments, and keyword
        arguments.
        """
        return (
            self.__class__.__name__,
            self._constructor_args[0],
            self._constructor_args[1],
        )

    def reduce(self, operation, in_between, app_label=None):
        """
        Return either a list of operations the actual operation should be
        replaced with or a boolean that indicates whether or not the specified
        operation can be optimized across.
        """
        if self.elidable:
            return [operation]
        elif operation.elidable:
            return [self]
        return False

    def __repr__(self):
        return "<%s %s%s>" % (
            self.__class__.__name__,
            ", ".join(map(repr, self._constructor_args[0])),
            ",".join(" %s=%r" % x for x in self._constructor_args[1].items()),
        )


class TableOperation(Operation):
    def __init__(self, name):
        self.name = name

    def reduce(self, operation, in_between, app_label=None):
        return (
            super(TableOperation, self).reduce(operation, in_between, app_label=app_label) or
            not operation.references_model(self.name, app_label)
        )


class CreateModel(TableOperation):
    serialization_expand_args = ['fields', 'options']

    def __init__(self, name, fields=None, options=None):
        self.name = name
        #self.bases = bases
        self.fields = fields
        self.options = options or {}
        super(CreateModel, self).__init__(name)

    def deconstruct(self):
        kwargs = {
            'name': self.name,
            'fields': self.fields,
        }
        if self.options:
            kwargs['options'] = self.options
        return (
            self.__class__.__name__,
            [],
            kwargs
        )

    @cached_property
    def name_lower(self):
        return self.name.lower()

    def references_model(self, name, app_label=None):
        return name.lower() == self.name_lower

    def describe(self):
        return "Create %smodel %s" % ("proxy " if self.options.get("proxy", False) else "", self.name)

    def model_to_key(self, model):
        """
        Take either a model class or an "app_label.ModelName" string
        and return (app_label, object_name).
        """
        if isinstance(model, str):
            return model.split(".", 1)
        else:
            return model._meta.app_label, model._meta.object_name

    def state_forwards(self, app_label, state):
        state.add_model(ModelState(
            app_label,
            self.name,
            list(self.fields),
            dict(self.options),
            tuple(self.bases),
            list(self.managers),
        ))

    def reduce(self, operation, in_between, app_label=None):
        if (isinstance(operation, DeleteModel) and
                self.name_lower == operation.name_lower and
                not self.options.get("proxy", False)):
            return []
        elif isinstance(operation, RenameTable) and self.name_lower == operation.old_name_lower:
            return [
                CreateModel(
                    operation.new_name,
                    fields=self.fields,
                    options=self.options,
                ),
            ]
        elif isinstance(operation, FieldOperation) and self.name_lower == operation.model_name_lower:
            if isinstance(operation, AddField):
                # Don't allow optimizations of FKs through models they reference
                if hasattr(operation.field, "remote_field") and operation.field.remote_field:
                    for between in in_between:
                        # Check that it doesn't point to the model
                        app_label, object_name = self.model_to_key(operation.field.remote_field.model)
                        if between.references_model(object_name, app_label):
                            return False
                        # Check that it's not through the model
                        if getattr(operation.field.remote_field, "through", None):
                            app_label, object_name = self.model_to_key(operation.field.remote_field.through)
                            if between.references_model(object_name, app_label):
                                return False
                return [
                    CreateModel(
                        self.name,
                        fields=self.fields + [(operation.name, operation.field)],
                        options=self.options,
                    ),
                ]
            elif isinstance(operation, AlterField):
                return [
                    CreateModel(
                        self.name,
                        fields=[
                            (n, operation.field if n == operation.name else v)
                            for n, v in self.fields
                        ],
                        options=self.options,
                    ),
                ]
            elif isinstance(operation, RemoveField):
                return [
                    CreateModel(
                        self.name,
                        fields=[
                            (n, v)
                            for n, v in self.fields
                            if n.lower() != operation.name_lower
                        ],
                        options=self.options,
                    ),
                ]
            elif isinstance(operation, RenameField):
                return [
                    CreateModel(
                        self.name,
                        fields=[
                            (operation.new_name if n == operation.old_name else n, v)
                            for n, v in self.fields
                        ],
                        options=self.options,
                    ),
                ]
        return super(CreateModel, self).reduce(operation, in_between, app_label=app_label)


class DeleteModel(TableOperation):
    """
    Drops a model's table.
    """

    def deconstruct(self):
        kwargs = {
            'name': self.name,
        }
        return (
            self.__class__.__name__,
            [],
            kwargs
        )

    def state_forwards(self, app_label, state):
        state.remove_model(app_label, self.name_lower)

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = from_state.apps.get_model(app_label, self.name)
        if self.allow_migrate_model(schema_editor.connection.alias, model):
            schema_editor.delete_model(model)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.name)
        if self.allow_migrate_model(schema_editor.connection.alias, model):
            schema_editor.create_model(model)

    def describe(self):
        return "Delete model %s" % (self.name, )


class RenameTable(TableOperation):
    """
    Renames a model.
    """

    def __init__(self, old_name, new_name):
        self.old_name = old_name
        self.new_name = new_name
        super(RenameTable, self).__init__(old_name)

    @cached_property
    def old_name_lower(self):
        return self.old_name.lower()

    @cached_property
    def new_name_lower(self):
        return self.new_name.lower()

    def deconstruct(self):
        kwargs = {
            'old_name': self.old_name,
            'new_name': self.new_name,
        }
        return (
            self.__class__.__name__,
            [],
            kwargs
        )

    def state_forwards(self, app_label, state):
        apps = state.apps
        model = apps.get_model(app_label, self.old_name)
        model._meta.apps = apps
        # Get all of the related objects we need to repoint
        all_related_objects = (
            f for f in model._meta.get_fields(include_hidden=True)
            if f.auto_created and not f.concrete and (not f.hidden or f.many_to_many)
        )
        # Rename the model
        state.models[app_label, self.new_name_lower] = state.models[app_label, self.old_name_lower]
        state.models[app_label, self.new_name_lower].name = self.new_name
        state.remove_model(app_label, self.old_name_lower)
        # Repoint the FKs and M2Ms pointing to us
        for related_object in all_related_objects:
            if related_object.model is not model:
                # The model being renamed does not participate in this relation
                # directly. Rather, a superclass does.
                continue
            # Use the new related key for self referential related objects.
            if related_object.related_model == model:
                related_key = (app_label, self.new_name_lower)
            else:
                related_key = (
                    related_object.related_model._meta.app_label,
                    related_object.related_model._meta.model_name,
                )
            new_fields = []
            for name, field in state.models[related_key].fields:
                if name == related_object.field.name:
                    field = field.clone()
                    field.remote_field.model = "%s.%s" % (app_label, self.new_name)
                new_fields.append((name, field))
            state.models[related_key].fields = new_fields
            state.reload_model(*related_key)
        # Repoint M2Ms with through pointing to us
        related_models = {
            f.remote_field.model for f in model._meta.fields
            if getattr(f.remote_field, 'model', None)
        }
        model_name = '%s.%s' % (app_label, self.old_name)
        for related_model in related_models:
            if related_model == model:
                related_key = (app_label, self.new_name_lower)
            else:
                related_key = (related_model._meta.app_label, related_model._meta.model_name)
            new_fields = []
            changed = False
            for name, field in state.models[related_key].fields:
                if field.is_relation and field.many_to_many and field.remote_field.through == model_name:
                    field = field.clone()
                    field.remote_field.through = '%s.%s' % (app_label, self.new_name)
                    changed = True
                new_fields.append((name, field))
            if changed:
                state.models[related_key].fields = new_fields
                state.reload_model(*related_key)
        state.reload_model(app_label, self.new_name_lower)

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        new_model = to_state.apps.get_model(app_label, self.new_name)
        if self.allow_migrate_model(schema_editor.connection.alias, new_model):
            old_model = from_state.apps.get_model(app_label, self.old_name)
            # Move the main table
            schema_editor.alter_db_table(
                new_model,
                old_model._meta.db_table,
                new_model._meta.db_table,
            )
            # Alter the fields pointing to us
            for related_object in old_model._meta.related_objects:
                if related_object.related_model == old_model:
                    model = new_model
                    related_key = (app_label, self.new_name_lower)
                else:
                    model = related_object.related_model
                    related_key = (
                        related_object.related_model._meta.app_label,
                        related_object.related_model._meta.model_name,
                    )
                to_field = to_state.apps.get_model(
                    *related_key
                )._meta.get_field(related_object.field.name)
                schema_editor.alter_field(
                    model,
                    related_object.field,
                    to_field,
                )
            # Rename M2M fields whose name is based on this model's name.
            fields = zip(old_model._meta.local_many_to_many, new_model._meta.local_many_to_many)
            for (old_field, new_field) in fields:
                # Skip self-referential fields as these are renamed above.
                if new_field.model == new_field.related_model or not new_field.remote_field.through._meta.auto_created:
                    continue
                # Rename the M2M table that's based on this model's name.
                old_m2m_model = old_field.remote_field.through
                new_m2m_model = new_field.remote_field.through
                schema_editor.alter_db_table(
                    new_m2m_model,
                    old_m2m_model._meta.db_table,
                    new_m2m_model._meta.db_table,
                )
                # Rename the column in the M2M table that's based on this
                # model's name.
                schema_editor.alter_field(
                    new_m2m_model,
                    old_m2m_model._meta.get_field(old_model._meta.model_name),
                    new_m2m_model._meta.get_field(new_model._meta.model_name),
                )

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        self.new_name_lower, self.old_name_lower = self.old_name_lower, self.new_name_lower
        self.new_name, self.old_name = self.old_name, self.new_name

        self.database_forwards(app_label, schema_editor, from_state, to_state)

        self.new_name_lower, self.old_name_lower = self.old_name_lower, self.new_name_lower
        self.new_name, self.old_name = self.old_name, self.new_name

    def references_model(self, name, app_label=None):
        return (
            name.lower() == self.old_name_lower or
            name.lower() == self.new_name_lower
        )

    def describe(self):
        return "Rename model %s to %s" % (self.old_name, self.new_name)

    def reduce(self, operation, in_between, app_label=None):
        if (isinstance(operation, RenameTable) and
                self.new_name_lower == operation.old_name_lower):
            return [
                RenameTable(
                    self.old_name,
                    operation.new_name,
                ),
            ]
        # Skip `ModelOperation.reduce` as we want to run `references_model`
        # against self.new_name.
        return (
            super(TableOperation, self).reduce(operation, in_between, app_label=app_label) or
            not operation.references_model(self.new_name, app_label)
        )


class AlterTable(Operation):
    def __init__(self, name, fields=None, options=None):
        self.name = name
        self.fields = fields
        self.options = options


class FieldOperation(Operation):
    def __init__(self, model_name, name):
        self.model_name = model_name
        self.name = name

    @cached_property
    def model_name_lower(self):
        return self.model_name.lower()

    @cached_property
    def name_lower(self):
        return self.name.lower()

    def is_same_model_operation(self, operation):
        return self.model_name_lower == operation.model_name_lower

    def is_same_field_operation(self, operation):
        return self.is_same_model_operation(operation) and self.name_lower == operation.name_lower

    def references_model(self, name, app_label=None):
        return name.lower() == self.model_name_lower

    def references_field(self, model_name, name, app_label=None):
        return self.references_model(model_name) and name.lower() == self.name_lower

    def reduce(self, operation, in_between, app_label=None):
        return (
            super(FieldOperation, self).reduce(operation, in_between, app_label=app_label) or
            not operation.references_field(self.model_name, self.name, app_label)
        )


class AddField(FieldOperation):
    def __init__(self, model_name, name, field):
        self.field = field
        super(AddField, self).__init__(model_name, name)

    def describe(self):
        return 'Add field %s to %s' % (self.name, self.model_name)


class AlterField(Operation):
    def __init__(self, model_name, name, field):
        self.model_name = model_name
        self.name = name
        self.field = field

    def describe(self):
        return 'Alter field %s on %s' % (self.name, self.model_name)


class RenameField(Operation):
    def __init__(self, model_name, old_name, new_name):
        self.model_name = model_name
        self.old_name = old_name
        self.new_name = new_name

    def describe(self):
        return 'Rename field %s on %s to %s' % (self.old_name, self.model_name, self.new_name)


class DeleteField(Operation):
    def __init__(self, model_name, name):
        self.model_name = model_name
        self.name = name

    def apply(self, migration):
        pass

    def describe(self):
        return 'Drop field %s from %s' % (self.name, self.model_name)


class IndexOperation(Operation):
    option_name = 'indexes'

    @cached_property
    def model_name_lower(self):
        return self.model_name.lower()


class AddIndex(IndexOperation):
    """
    Add an index on a model.
    """

    def __init__(self, model_name, index):
        self.model_name = model_name
        if not index._name:
            raise ValueError(
                "Indexes passed to AddIndex operations require a name "
                "argument. %r doesn't have one." % index
            )
        self.index = index

    def state_forwards(self, app_label, state):
        model_state = state.models[app_label, self.model_name_lower]
        model_state.options[self.option_name].append(self.index)

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.model_name)
        if self.allow_migrate_model(schema_editor.connection.alias, model):
            schema_editor.add_index(model, self.index)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        model = from_state.apps.get_model(app_label, self.model_name)
        if self.allow_migrate_model(schema_editor.connection.alias, model):
            schema_editor.remove_index(model, self.index)

    def deconstruct(self):
        kwargs = {
            'model_name': self.model_name,
            'index': self.index,
        }
        return (
            self.__class__.__name__,
            [],
            kwargs,
        )

    def describe(self):
        return 'Create index on field(s) %s of model %s' % (
            ', '.join(self.index.fields),
            self.model_name,
        )


class RemoveIndex(IndexOperation):
    """
    Remove an index from a model.
    """

    def __init__(self, model_name, name):
        self.model_name = model_name
        self.name = name

    def state_forwards(self, app_label, state):
        model_state = state.models[app_label, self.model_name_lower]
        indexes = model_state.options[self.option_name]
        model_state.options[self.option_name] = [idx for idx in indexes if idx.name != self.name]

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = from_state.apps.get_model(app_label, self.model_name)
        if self.allow_migrate_model(schema_editor.connection.alias, model):
            from_model_state = from_state.models[app_label, self.model_name_lower]
            index = from_model_state.get_index_by_name(self.name)
            schema_editor.remove_index(model, index)

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.model_name)
        if self.allow_migrate_model(schema_editor.connection.alias, model):
            to_model_state = to_state.models[app_label, self.model_name_lower]
            index = to_model_state.get_index_by_name(self.name)
            schema_editor.add_index(model, index)

    def deconstruct(self):
        kwargs = {
            'model_name': self.model_name,
            'name': self.name,
        }
        return (
            self.__class__.__name__,
            [],
            kwargs,
        )

    def describe(self):
        return 'Remove index %s from %s' % (self.name, self.model_name)


class RunSQL(object):
    pass
