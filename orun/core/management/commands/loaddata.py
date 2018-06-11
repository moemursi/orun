import os

from orun import app
from orun.apps import apps
from orun.core.management import commands
from orun.core.serializers import get_deserializer
from orun.db import transaction


@commands.command('loaddata')
@commands.argument(
    'app_label', nargs=1,
)
@commands.argument(
    'fixture', nargs=1,
)
def command(app_label, fixture, **options):
    load_fixture(app_label, fixture, **options)


@transaction.atomic
def load_fixture(app_config, filename, **options):
    if isinstance(app_config, str):
        app_config = apps.app_configs[app_config]
    fpath = os.path.join(app_config.path, 'fixtures', filename)
    format = filename.rsplit('.', 1)[1]
    deserializer = get_deserializer(format)
    with open(fpath, encoding='utf-8') as f:
        options['filename'] = fpath
        try:
            deserializer(f, app, app_config=app_config, app_label=app_config.schema, **options)
        except:
            print('Error loading the file', filename, app_config)
            raise
