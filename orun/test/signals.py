import os
import threading
import time
import warnings

from orun.apps import apps
from orun.core.signals import setting_changed
from orun.db import connections, router
from orun.db.utils import ConnectionRouter
from orun.dispatch import Signal
from orun.utils import timezone
from orun.utils.functional import empty

template_rendered = Signal()

# Most setting_changed receivers are supposed to be added below,
# except for cases where the receiver is related to a contrib app.

# Settings that may not work well when using 'override_settings' (#19031)
COMPLEX_OVERRIDE_SETTINGS = {'DATABASES'}


@setting_changed.connect
def clear_cache_handlers(sender, **kwargs):
    if kwargs['setting'] == 'CACHES':
        from orun.core.cache import caches
        caches._caches = threading.local()


@setting_changed.connect
def update_installed_apps(sender, **kwargs):
    if kwargs['setting'] == 'INSTALLED_APPS':
        # Rebuild any AppDirectoriesFinder instance.
        return
        from orun.contrib.staticfiles.finders import get_finder
        get_finder.cache_clear()
        # Rebuild management commands cache
        from orun.core.management import get_commands
        get_commands.cache_clear()
        # Rebuild get_app_template_dirs cache.
        from orun.template.utils import get_app_template_dirs
        get_app_template_dirs.cache_clear()
        # Rebuild translations cache.
        from orun.utils.translation import trans_real
        trans_real._translations = {}


@setting_changed.connect
def update_connections_time_zone(sender, **kwargs):
    if kwargs['setting'] == 'TIME_ZONE':
        # Reset process time zone
        if hasattr(time, 'tzset'):
            if kwargs['value']:
                os.environ['TZ'] = kwargs['value']
            else:
                os.environ.pop('TZ', None)
            time.tzset()

        # Reset local time zone cache
        timezone.get_default_timezone.cache_clear()

    # Reset the database connections' time zone
    if kwargs['setting'] in {'TIME_ZONE', 'USE_TZ'}:
        for conn in connections.all():
            try:
                del conn.timezone
            except AttributeError:
                pass
            try:
                del conn.timezone_name
            except AttributeError:
                pass
            conn.ensure_timezone()


@setting_changed.connect
def clear_routers_cache(sender, **kwargs):
    if kwargs['setting'] == 'DATABASE_ROUTERS':
        router.routers = ConnectionRouter().routers


@setting_changed.connect
def reset_template_engines(sender, **kwargs):
    if kwargs['setting'] in {
        'TEMPLATES',
        'DEBUG',
        'FILE_CHARSET',
        'INSTALLED_APPS',
    }:
        pass


@setting_changed.connect
def clear_serializers_cache(sender, **kwargs):
    if kwargs['setting'] == 'SERIALIZATION_MODULES':
        from orun.core import serializers
        serializers._serializers = {}


@setting_changed.connect
def language_changed(sender, **kwargs):
    if kwargs['setting'] in {'LANGUAGES', 'LANGUAGE_CODE', 'LOCALE_PATHS'}:
        from orun.utils.translation import trans_real
        trans_real._default = None
        trans_real._active = threading.local()
    if kwargs['setting'] in {'LANGUAGES', 'LOCALE_PATHS'}:
        from orun.utils.translation import trans_real
        trans_real._translations = {}
        trans_real.check_for_language.cache_clear()


@setting_changed.connect
def file_storage_changed(sender, **kwargs):
    if kwargs['setting'] == 'DEFAULT_FILE_STORAGE':
        from orun.core.files.storage import default_storage
        default_storage._wrapped = empty


@setting_changed.connect
def complex_setting_changed(sender, **kwargs):
    if kwargs['enter'] and kwargs['setting'] in COMPLEX_OVERRIDE_SETTINGS:
        # Considering the current implementation of the signals framework,
        # stacklevel=5 shows the line containing the override_settings call.
        warnings.warn("Overriding setting %s can lead to unexpected behavior."
                      % kwargs['setting'], stacklevel=5)


@setting_changed.connect
def root_urlconf_changed(sender, **kwargs):
    if kwargs['setting'] == 'ROOT_URLCONF':
        from orun.urls import clear_url_caches, set_urlconf
        clear_url_caches()
        set_urlconf(None)


@setting_changed.connect
def static_storage_changed(sender, **kwargs):
    if kwargs['setting'] in {
        'STATICFILES_STORAGE',
        'STATIC_ROOT',
        'STATIC_URL',
    }:
        from orun.contrib.staticfiles.storage import staticfiles_storage
        staticfiles_storage._wrapped = empty


@setting_changed.connect
def static_finders_changed(sender, **kwargs):
    if kwargs['setting'] in {
        'STATICFILES_DIRS',
        'STATIC_ROOT',
    }:
        from orun.contrib.staticfiles.finders import get_finder
        get_finder.cache_clear()


@setting_changed.connect
def auth_password_validators_changed(sender, **kwargs):
    if kwargs['setting'] == 'AUTH_PASSWORD_VALIDATORS':
        from orun.contrib.auth.password_validation import get_default_password_validators
        get_default_password_validators.cache_clear()


@setting_changed.connect
def user_model_swapped(sender, **kwargs):
    if kwargs['setting'] == 'AUTH_USER_MODEL':
        apps.clear_cache()
