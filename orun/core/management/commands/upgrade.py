import os

from orun import app
from orun.conf import settings
from orun.utils.translation import activate
from orun.core.management import commands
from orun.apps import apps
from orun.core.serializers import get_deserializer


@commands.command('upgrade')
@commands.argument(
    'app_labels', nargs=-1,
)
def command(app_labels, **options):
    for app_label in app_labels:
        addon = apps.app_configs[app_label]
        cmd = Command()
        cmd.handle_app_config(addon, **options)


def load_fixture(app_config, filename):
    fpath = os.path.join(app_config.path, 'fixtures', filename)
    format = filename.rsplit('.', 1)[1]
    deserializer = get_deserializer(format)
    f = open(fpath, encoding='utf-8')
    deserializer(f, app, app_config=app_config, app_label=app_config.schema).deserialize()


class Command(object):
    help = 'Upgrade modules'

    def _load_file(self, app_config, filename):
        #s = open(filename, encoding='utf-8').read()
        #s = Template(s).render(settings=settings)
        activate(settings.LANGUAGE_CODE)
        load_fixture(app_config, filename)
        #xml_serializer.Deserializer(s)

    def handle_app_config(self, app_config, **options):
        """
        Perform the command's actions for app_config, an AppConfig instance
        corresponding to an application label given on the command line.
        """
        data = getattr(app_config, 'fixtures', None)
        if data:
            for filename in data:
                filename = os.path.join(app_config.path, 'fixtures', filename)
                self._load_file(app_config, filename)
