import os

from orun import app
from orun.apps import apps
from orun.core.management import commands
from orun.apps import apps
from orun.core.serializers import get_deserializer


@commands.command('loaddata')
@commands.argument(
    'app_label', nargs=1,
)
@commands.argument(
    'fixture', nargs=1,
)
def command(app_label, fixture, **options):
    load_fixture(app_label, fixture, **options)


def load_fixture(app_config, filename, **options):
    if isinstance(app_config, str):
        app_config = apps.app_configs[app_config]
    fpath = os.path.join(app_config.path, 'fixtures', filename)
    format = filename.rsplit('.', 1)[1]
    deserializer = get_deserializer(format)
    f = open(fpath, encoding='utf-8')
    options['filename'] = fpath
    deserializer(f, app, app_config=app_config, app_label=app_config.schema, **options)
