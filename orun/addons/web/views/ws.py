from orun import socketio
from flask_socketio import Namespace


class WebApi(Namespace):
    def on_connect(self):
        pass

socketio.on_namespace(WebApi('/web/api'))
