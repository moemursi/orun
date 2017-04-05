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
settings.setdefault('DATE_INPUT_FORMATS', [
    '%Y-%m-%d', '%m/%d/%Y', '%m/%d/%y',  # '2006-10-25', '10/25/2006', '10/25/06'
    '%b %d %Y', '%b %d, %Y',  # 'Oct 25 2006', 'Oct 25, 2006'
    '%d %b %Y', '%d %b, %Y',  # '25 Oct 2006', '25 Oct, 2006'
    '%B %d %Y', '%B %d, %Y',  # 'October 25 2006', 'October 25, 2006'
    '%d %B %Y', '%d %B, %Y',  # '25 October 2006', '25 October, 2006'
])
settings.setdefault('TIME_INPUT_FORMATS', [
    '%H:%M:%S',  # '14:30:59'
    '%H:%M:%S.%f',  # '14:30:59.000200'
    '%H:%M',  # '14:30'
])
settings.setdefault('TIME_INPUT_FORMATS', [
    '%Y-%m-%d %H:%M:%S',     # '2006-10-25 14:30:59'
    '%Y-%m-%d %H:%M:%S.%f',  # '2006-10-25 14:30:59.000200'
    '%Y-%m-%d %H:%M',        # '2006-10-25 14:30'
    '%Y-%m-%d',              # '2006-10-25'
    '%m/%d/%Y %H:%M:%S',     # '10/25/2006 14:30:59'
    '%m/%d/%Y %H:%M:%S.%f',  # '10/25/2006 14:30:59.000200'
    '%m/%d/%Y %H:%M',        # '10/25/2006 14:30'
    '%m/%d/%Y',              # '10/25/2006'
    '%m/%d/%y %H:%M:%S',     # '10/25/06 14:30:59'
    '%m/%d/%y %H:%M:%S.%f',  # '10/25/06 14:30:59.000200'
    '%m/%d/%y %H:%M',        # '10/25/06 14:30'
    '%m/%d/%y',              # '10/25/06'
])

settings.setdefault('SUPERUSER_ID', 1)
settings.setdefault('SUPERUSER', 'admin')
settings.setdefault('PASSWORD', 'admin')
