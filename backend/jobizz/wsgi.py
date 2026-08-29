"""WSGI config for Jobizz."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "jobizz.settings.prod")

application = get_wsgi_application()
