from flask import current_app


class Settings(object):
    def __getattr__(self, item):
        if not item.startswith('_'):
            return current_app.config[item]

    def __getitem__(self, item):
        return current_app.config[item]

settings = Settings()
