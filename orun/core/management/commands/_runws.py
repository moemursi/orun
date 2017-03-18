import os
from flask_socketio import SocketIO

from orun.core.management import commands


@commands.command('runws', short_help='Runs a web-socket development server.')
@commands.option('--host', '-h', default='127.0.0.1',
              help='The interface to bind to.')
@commands.option('--port', '-p', default=5000,
              help='The port to bind to.')
@commands.option('--reload/--no-reload', default=None,
              help='Enable or disable the reloader.  By default the reloader '
              'is active if debug is enabled.')
@commands.option('--debugger/--no-debugger', default=None,
              help='Enable or disable the debugger.  By default the debugger '
              'is active if debug is enabled.')
@commands.option('--eager-loading/--lazy-loader', default=None,
              help='Enable or disable eager loading.  By default eager '
              'loading is enabled if the reloader is disabled.')
def command(host, port, reload, debugger, eager_loading, with_threads, **kwargs):
    debug = True
    if reload is None:
        reload = bool(debug)
    if debugger is None:
        debugger = bool(debug)
    if eager_loading is None:
        eager_loading = not reload

    from flask.globals import _app_ctx_stack
    app = _app_ctx_stack.top.app

    print(' * Serving Orun app "%s"' % app.import_name)
    if debug:
        print(' * Forcing debug mode %s' % (debug and 'on' or 'off'))
    io = SocketIO(app)

    io.run(app, host=host, port=port, use_debugger=debugger)
