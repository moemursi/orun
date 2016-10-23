from flask import current_app


ADDONS_ENVIRONMENT_VARIABLE = 'ORUN_ADDONS_PATH'


class Settings(object):
    def __getattr__(self, item):
        if not item.startswith('_'):
            return current_app.config[item]

    def __getitem__(self, item):
        return current_app.config[item]

settings = Settings()
