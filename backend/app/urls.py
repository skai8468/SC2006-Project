from django.urls import include, path
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from . import views

urlpatterns = [
    path('properties/', views.PropertyView.as_view(), name='properties_list'),
    # path('api/properties/<int:pk>/', PropertyDetail.as_view(), name='property-detail'),
    # path('api/properties/search/', PropertySearch.as_view(), name='property-search'),
]


if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
