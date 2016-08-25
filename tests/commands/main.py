from orun.apps import Application

app = Application('main')
with app.app_context():
    app.cli()
