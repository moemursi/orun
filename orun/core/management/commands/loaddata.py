import os
from itertools import product
from pathlib import Path

from orun.apps import apps
from orun.core import serializers
from orun.db import DEFAULT_DB_ALIAS, transaction
from orun.core.management.base import BaseCommand, CommandError


def load_fixture(schema, *filenames, **options):
    if isinstance(schema, str):
        addon = apps.addons[schema]
    else:
        addon = schema
    for filename in filenames:
        filename = os.path.join(addon.path, 'fixtures', filename)
        fixture, fmt = filename.rsplit('.', 1)
        deserializer = serializers.get_deserializer(fmt)
        # find fixture by the database alias
        fname = f'{fixture}.{options["database"]}.{fmt}'
        if not os.path.isfile(fname):
            fname = filename
        d = deserializer(Path(fname), addon=addon, format=fmt, filename=filename, **options)

        with transaction.atomic(options['database']):
            d.deserialize()
        if d.postpone:
            for op in d.postpone:
                op()


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            'args', nargs='+',
            help='Specify the schema and filenames.',
        )
        parser.add_argument(
            '--database',
            default=DEFAULT_DB_ALIAS,
            help='Nominates a specific database to dump fixtures from. '
                 'Defaults to the "default" database.',
        )

    def handle(self, schema, *filenames, **options):
        load_fixture(schema, *filenames, **options)
