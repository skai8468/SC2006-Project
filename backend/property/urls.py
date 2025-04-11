# Description: This file contains the URL patterns for the app.

from django.urls import include, path
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter

from . import views

urlpatterns = [
    path('all/', views.PropertyListView.as_view(), name='properties_list'),
    path('details/<int:pk>/', views.PropertyDetailView.as_view(), name='property_detail'),
    path('details/<int:property_id>/images/', views.PropertyImageUploadView.as_view(), name='upload_images'),
    path('creating-request/', views.CreatePropertyRequestView.as_view(), name='create_property_request'),
    path('updating-request/', views.UpdatePropertyRequestView.as_view(), name='update_property_request'),
    path('requests/', views.PropertyRequestListView.as_view(), name='property_requests'),
    path('requests/<int:pk>/', views.PropertyRequestDetailView.as_view(), name='property_request_detail'),
    path('requests/<int:pk>/accept/', views.AcceptPropertyRequestView.as_view(), name='accept_property_request'),
    path('requests/<int:pk>/reject/', views.RejectPropertyRequestView.as_view(), name='reject_property_request'),
    path('api/auth/verify/', views.TokenVerifyView.as_view(), name='token-verify'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)