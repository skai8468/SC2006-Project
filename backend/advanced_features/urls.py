from django.urls import include, path

from .views import *

urlpatterns = [
    path('predict-rent/', RentingPredictionView.as_view(), name='predict_rent'),
    path('predict-rent-12-months/', RentingPrediction12MonthsView.as_view(), name='predict_rent_12_months'),
]