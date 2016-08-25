import os

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
    addon = apps.addons[app_label]
    load_fixture(addon, fixture)


def load_fixture(addon, filename):
    fpath = os.path.join(addon.path, 'fixtures', filename)
    format = filename.rsplit('.', 1)[1]
    deserializer = get_deserializer(format)
    f = open(fpath, encoding='utf-8')
    deserializer(f, app_label=addon.schema)
