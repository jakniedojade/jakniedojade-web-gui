"""!
@brief This file is used to register models in the admin interface.

Currently we don't use it, but it may be useful in the future.
"""

from django.contrib import admin
from latency_analyzer.models import Route, Stop, StopTime, Trip, Latency

admin.site.register(Route)
admin.site.register(Stop)
admin.site.register(Trip)
admin.site.register(Latency)
admin.site.register(StopTime)
