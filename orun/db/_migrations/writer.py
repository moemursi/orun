import os
import re
from importlib import import_module

from orun.utils.version import get_version
from orun.utils.inspect import get_func_args
from orun.utils.timezone import now
from orun.db import migrations
from orun.db.migrations.serializer import DeconstructableSerializer, serializer_factory
from orun.db.migrations.loader import MigrationLoader
from orun.utils.encoding import force_text
from orun.utils.module_loading import module_dir


class OperationWriter(object):
    def __init__(self, operation, indentation=2):
        self.operation = operation
        self.buff = []
        self.indentation = indentation

    def serialize(self):

        def _write(_arg_name, _arg_value):
            if (_arg_name in self.operation.serialization_expand_args and
                    isinstance(_arg_value, (list, tuple, dict))):
                if isinstance(_arg_value, dict):
                    self.feed('%s={' % _arg_name)
                    self.indent()
                    for key, value in _arg_value.items():
                        key_string, key_imports = MigrationWriter.serialize(key)
                        arg_string, arg_imports = MigrationWriter.serialize(value)
                        args = arg_string.splitlines()
                        if len(args) > 1:
                            self.feed('%s: %s' % (key_string, args[0]))
                            for arg in args[1:-1]:
                                self.feed(arg)
                            self.feed('%s,' % args[-1])
                        else:
                            self.feed('%s: %s,' % (key_string, arg_string))
                        imports.update(key_imports)
                        imports.update(arg_imports)
                    self.unindent()
                    self.feed('},')
                else:
                    self.feed('%s=[' % _arg_name)
                    self.indent()
                    for item in _arg_value:
                        arg_string, arg_imports = MigrationWriter.serialize(item)
                        args = arg_string.splitlines()
                        if len(args) > 1:
                            for arg in args[:-1]:
                                self.feed(arg)
                            self.feed('%s,' % args[-1])
                        else:
                            self.feed('%s,' % arg_string)
                        imports.update(arg_imports)
                    self.unindent()
                    self.feed('],')
            else:
                arg_string, arg_imports = MigrationWriter.serialize(_arg_value)
                args = arg_string.splitlines()
                if len(args) > 1:
                    self.feed('%s=%s' % (_arg_name, args[0]))
                    for arg in args[1:-1]:
                        self.feed(arg)
                    self.feed('%s,' % args[-1])
                else:
                    self.feed('%s=%s,' % (_arg_name, arg_string))
                imports.update(arg_imports)

        imports = set()
        name, args, kwargs = self.operation.deconstruct()
        operation_args = get_func_args(self.operation.__init__)

        # See if this operation is in orun.db.migrations. If it is,
        # We can just use the fact we already have that imported,
        # otherwise, we need to add an import for the operation class.
        if getattr(migrations, name, None) == self.operation.__class__:
            self.feed('migrations.%s(' % name)
        else:
            imports.add('import %s' % (self.operation.__class__.__module__))
            self.feed('%s.%s(' % (self.operation.__class__.__module__, name))

        self.indent()

        for i, arg in enumerate(args):
            arg_value = arg
            arg_name = operation_args[i]
            _write(arg_name, arg_value)

        i = len(args)
        # Only iterate over remaining arguments
        for arg_name in operation_args[i:]:
            if arg_name in kwargs:  # Don't sort to maintain signature order
                arg_value = kwargs[arg_name]
                _write(arg_name, arg_value)

        self.unindent()
        self.feed('),')
        return self.render(), imports

    def indent(self):
        self.indentation += 1

    def unindent(self):
        self.indentation -= 1

    def feed(self, line):
        self.buff.append(' ' * (self.indentation * 4) + line)

    def render(self):
        return '\n'.join(self.buff)


class MigrationWriter(object):
    def __init__(self, migration):
        self.migration = migration

    def as_string(self):
        """
        Returns a string of the file contents.
        """
        items = {
            "replaces_str": "",
            "initial_str": "",
        }

        imports = set()

        # Deconstruct operations
        operations = []
        for operation in self.migration.operations:
            operation_string, operation_imports = OperationWriter(operation).serialize()
            imports.update(operation_imports)
            operations.append(operation_string)
        items["operations"] = "\n".join(operations) + "\n" if operations else ""

        # Format dependencies and write out swappable dependencies right
        dependencies = []
        for dependency in self.migration.dependencies:
            if dependency[0] == "__setting__":
                dependencies.append("        migrations.swappable_dependency(settings.%s)," % dependency[1])
                imports.add("from orun.conf import settings")
            else:
                # No need to output bytestrings for dependencies
                dependency = tuple(force_text(s) for s in dependency)
                dependencies.append("        %s," % self.serialize(dependency)[0])
        items["dependencies"] = "\n".join(dependencies) + "\n" if dependencies else ""

        # Format imports nicely, swapping imports of functions from migration files
        # for comments
        migration_imports = set()
        for line in list(imports):
            if re.match("^import (.*)\.\d+[^\s]*$", line):
                migration_imports.add(line.split("import")[1].strip())
                imports.remove(line)
                self.needs_manual_porting = True

        # orun.db.migrations is always used, but models import may not be.
        # If models import exists, merge it with migrations import.
        if "from orun.db import models" in imports:
            imports.discard("from orun.db import models")
            imports.add("from orun.db import migrations, models")
        else:
            imports.add("from orun.db import migrations")

        # Sort imports by the package / module to be imported (the part after
        # "from" in "from ... import ..." or after "import" in "import ...").
        sorted_imports = sorted(imports, key=lambda i: i.split()[1])
        items["imports"] = "\n".join(sorted_imports) + "\n" if imports else ""
        if migration_imports:
            items["imports"] += (
                "\n\n# Functions from the following migrations need manual "
                "copying.\n# Move them and any dependencies into this file, "
                "then update the\n# RunPython operations to refer to the local "
                "versions:\n# %s"
            ) % "\n# ".join(sorted(migration_imports))
        # If there's a replaces, make a string for it
        if self.migration.replaces:
            items['replaces_str'] = "\n    replaces = %s\n" % self.serialize(self.migration.replaces)[0]
        # Hinting that goes into comment
        items.update(
            version=get_version(),
            timestamp=now().strftime("%Y-%m-%d %H:%M"),
        )

        if self.migration.initial:
            items['initial_str'] = "\n    initial = True\n"

        return (MIGRATION_TEMPLATE % items).encode("utf8")

    @property
    def basedir(self):
        migrations_package_name = MigrationLoader(None, load=False).migrations_module(self.migration.app_label)
        try:
            migrations_module = import_module(migrations_package_name)
        except ImportError:
            pass
        else:
            return module_dir(migrations_module)
        base_dir = os.path.join(self.migration.app_config.root_path, 'migrations')
        os.makedirs(base_dir)
        with open(os.path.join(base_dir, '__init__.py'), 'w'):
            pass
        if self.migration.app_config.version:
            version = str(self.migration.app_config.version).replace('.', '_')
        else:
            version = 'initial'
        base_dir = os.path.join(base_dir, version)
        os.makedirs(base_dir)
        with open(os.path.join(base_dir, '__init__.py'), 'w'):
            pass
        return base_dir

    @property
    def filename(self):
        return '%s.py' % self.migration.name

    @property
    def path(self):
        return os.path.join(self.basedir, self.filename)

    @classmethod
    def serialize(cls, value):
        return serializer_factory(value).serialize()


MIGRATION_TEMPLATE = """\
# Generated by Orun %(version)s on %(timestamp)s

%(imports)s

class Migration(migrations.Migration):
%(replaces_str)s%(initial_str)s
    dependencies = [
%(dependencies)s\
    ]

    operations = [
%(operations)s\
    ]
"""
