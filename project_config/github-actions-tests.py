"""!
Django settings module for tests run with manage.py test

This module includes the configuration settings used in a test environment
"""

from .settings import *
from .settings import BASE_DIR

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3'
    }
}
