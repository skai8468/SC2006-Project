from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.PropertySearchView.as_view(), name='property-search'),
]