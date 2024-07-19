"""!
@brief This file is used to configure the app.
"""

from django.apps import AppConfig


class LatencyAnalyzerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'latency_analyzer'
