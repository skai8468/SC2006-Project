from django.urls import include, path

from .views import RentingPredictionView

urlpatterns = [
    path('predict-rent/', RentingPredictionView.as_view(), name='predict_rent'),
]