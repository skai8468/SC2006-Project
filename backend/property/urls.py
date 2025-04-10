# Description: This file contains the URL patterns for the app.

from django.urls import include, path
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter

from . import views

urlpatterns = [
    path('all/', views.PropertyView.as_view(), name='properties_list'),
    path('details/user/<int:id>/', views.UserPropertiesView.as_view(), name='properties_list_user'),
    path('details/<int:pk>/', views.PropertyDetailView.as_view(), name='property_detail'),
    path('details/<int:pk>/update/', views.UpdatePropertyView.as_view(), name='update_property'),
    path('details/<int:property_id>/images/', views.PropertyImageUploadView.as_view(), name='upload_images'),
    path('create/', views.CreatePropertyView.as_view(), name='create_property'),
    path('creating-request/', views.CreatePropertyRequestView.as_view(), name='create_property_request'),
    path('api/auth/verify/', views.TokenVerifyView.as_view(), name='token-verify'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)