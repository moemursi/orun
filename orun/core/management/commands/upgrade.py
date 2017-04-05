import os

from orun.conf import settings
from orun.utils.translation import activate
from orun.core.management import commands
from orun.apps import apps
from orun.core.serializers import get_deserializer
from orun.core.management.commands.loaddata import load_fixture


@commands.command('upgrade')
@commands.argument(
    'app_labels', nargs=-1,
)
@commands.option('--with-demo/--without-demo', default=False, help='Load demo data.')
def command(app_labels, **options):
    for app_label in app_labels:
        addon = apps.app_configs[app_label]
        cmd = Command()
        cmd.handle_app_config(addon, **options)


class Command(object):
    help = 'Upgrade modules'

    def _load_file(self, app_config, filename):
        activate(settings.LANGUAGE_CODE)
        load_fixture(app_config, filename)

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
        if 'with_demo' in options:
            demo = getattr(app_config, 'demo', None)
            if demo:
                for filename in demo:
                    filename = os.path.join(app_config.path, 'fixtures', filename)
                    self._load_file(app_config, filename)
