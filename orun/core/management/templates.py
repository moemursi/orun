from orun.core.management.base import CommandError


def validate_name(name, app_or_project):
    if name is None:
        raise CommandError("you must provide %s %s name" % (
            "an" if app_or_project == "app" else "a", app_or_project))
    # If it's not a valid directory name.
    if not name.isidentifier():
        raise CommandError(
            "%r is not a valid %s name. Please make sure the name is "
            "a valid identifier." % (name, app_or_project)
        )
