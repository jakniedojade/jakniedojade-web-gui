"""!
Django settings module for the production environment.

This module contains the configuration settings used for the production environment.
"""

import os

from .settings import *
from .settings import BASE_DIR, SECRET_KEY

# Azure sets the domain an app is served from in WEBSITE_HOSTNAME
# Set ALLOWED_HOSTS TO this value if it exists (we are on Azure)
ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']] if 'WEBSITE_HOSTNAME' in os.environ else []
# And also add custom domains which were added to the app
ADDITIONAL_DOMAINS = os.getenv('ADDITIONAL_DOMAINS', None)
if ADDITIONAL_DOMAINS:
    ALLOWED_HOSTS += ADDITIONAL_DOMAINS.split(';')

CSRF_TRUSTED_ORIGINS = ['https://' + os.environ['WEBSITE_HOSTNAME']] if 'WEBSITE_HOSTNAME' in os.environ else []
DEBUG = False

# WhiteNoise configuration
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Add whitenoise middleware after the security middleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

# Whitenoise compressed static file cache
# Makes a unique URL with a hash for each static file so that browsers can cache them
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Secret Key
SECRET_KEY = os.getenv('SECRET_KEY', SECRET_KEY)

# This fixes `manage.py check --deploy` warnings
# Force CSRF cookie to be secure only (we don't need really it because we don't have state changing operations for now)
CSRF_COOKIE_SECURE = True
# Force session cookie to be secure only (we also don't need this one, this is just to fix the warning)
SESSION_COOKIE_SECURE = True
