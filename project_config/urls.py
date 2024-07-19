"""
URL configuration for project_config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import include, path
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from .views import index

from rest_framework import routers

from latency_analyzer.views import RouteViewSet, RouteStopsView, StopViewSet, RouteDetailsView, RoutesAtStopView, DateRangesView
from latency_analyzer.views import REST_API_VERSION_STRING


router = routers.DefaultRouter()

router.register(f'api/{REST_API_VERSION_STRING}/lines', RouteViewSet)
router.register(f'api/{REST_API_VERSION_STRING}/stops', StopViewSet)

urlpatterns = [
    path('', index, name='index'),

    # Redirect /favicon.ico URL to the actual URL the icon is served from
    path("favicon.ico", RedirectView.as_view(url="/static/img/favicon.ico", permanent=True)),

    path(f'api/{REST_API_VERSION_STRING}/lines/<str:line>/stops/', RouteStopsView.as_view(), name='api-line-stops'),
    path(f'api/{REST_API_VERSION_STRING}/lines/<str:line>/range', DateRangesView.as_view(), name='api-line-range'),
    path(f'api/{REST_API_VERSION_STRING}/lines/<str:line>/latency', RouteDetailsView.as_view(), name='api-line-latency'),
    path(f'api/{REST_API_VERSION_STRING}/stops/<str:stop>/lines/', RoutesAtStopView.as_view(), name='api-stop-lines'),
]

urlpatterns += router.urls

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
