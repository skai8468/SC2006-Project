# Description: This file contains the URL patterns for the app.

from django.urls import include, path
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('properties/', views.PropertyView.as_view(), name='properties_list'),
]