from orun import app
from orun.core.management import commands
from orun.db import connections, DEFAULT_DB_ALIAS


@commands.command('changepassword')
@commands.argument(
    'username', nargs=1, required=False,
    #help='App label of an addon to synchronize the state.',
)
def command(database, username, **options):
    with app.app_context(db=database):
        password = commands.prompt('New Password', hide_input=True)
        user = app['auth.user']
        u = user.objects.filter(user.c.username == username).one()
        u.password = password
        u.save()
        commands.echo('The password has been changed.')
