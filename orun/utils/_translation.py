from contextlib import ContextDecorator


def gettext(*args):
    return args[0]


def gettext_lazy(*args):
    return args[0]


def ngettext_lazy(*args):
    return args[0]


def string_concat(*args):
    return ''.join(args)


def pgettext(*args):
    return args[0]

class override(ContextDecorator):
    def __init__(self, language, deactivate=False):
        self.language = language
        self.deactivate = deactivate

    def __enter__(self):
        self.old_language = get_language()
        if self.language is not None:
            activate(self.language)
        else:
            deactivate_all()

    def __exit__(self, exc_type, exc_value, traceback):
        if self.old_language is None:
            deactivate_all()
        elif self.deactivate:
            deactivate()
        else:
            activate(self.old_language)

