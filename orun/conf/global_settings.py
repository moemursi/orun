settings = {}
settings.setdefault('INSTALLED_APPS', [])
settings.setdefault('DEFAULT_INDEX_TABLESPACE', None)
settings.setdefault('DEBUG', True)
settings.setdefault('LOCALE_PATHS', [])
settings.setdefault('LANGUAGE_CODE', 'pt-br')
settings.setdefault('USE_I18N', True)
settings.setdefault('USE_L10N', True)
settings.setdefault('USE_TZ', False)
settings.setdefault('DATABASES', {})
settings.setdefault('DATABASE_ROUTERS', [])
settings.setdefault('MIGRATION_MODULES', {})
settings.setdefault('MEDIA_ROOT', None)
settings.setdefault('STATIC_ROOT', None)
settings.setdefault('MAX_NAME_LENGTH', 30)
settings.setdefault('TIME_ZONE', None)
settings.setdefault('SERIALIZATION_MODULES', {})
settings.setdefault('DEFAULT_CHARSET', 'utf-8')

settings.setdefault('FORMAT_MODULE_PATH', None)
settings.setdefault('TIME_INPUT_FORMATS', [
    '%H:%M:%S',  # '14:30:59'
    '%H:%M:%S.%f',  # '14:30:59.000200'
    '%H:%M',  # '14:30'
])

settings.setdefault('SUPERUSER_ID', 1)
settings.setdefault('SUPERUSER', 'admin')
settings.setdefault('PASSWORD', 'admin')
