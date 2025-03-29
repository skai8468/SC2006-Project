from django.shortcuts import render
from rest_framework import generics

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .serializer import *
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.template import loader
import json
from django.conf import settings

class PropertyView(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    class Meta:
        model = Property
        fields = [
            'id',
            'address',
            'city',
            'state',
            'zip_code',
            'price',
            'bedrooms',
            'bathrooms',
            'square_feet'
        ]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                models.Q(title__icontains=search_query) |
                models.Q(location__icontains=search_query) |
                models.Q(address__icontains=search_query) |
                models.Q(city__icontains=search_query) |
                models.Q(state__icontains=search_query) |
                models.Q(zip_code__icontains=search_query)
            )
        
        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        bedrooms = self.request.query_params.get('bedrooms')
        if bedrooms:
            queryset = queryset.filter(bedrooms__gte=bedrooms)
            
        bathrooms = self.request.query_params.get('bathrooms')
        if bathrooms:
            queryset = queryset.filter(bathrooms__gte=bathrooms)
            
        return queryset
        

def check_base_dir(request):
    return HttpResponse(f"BASE_DIR: {settings.BASE_DIR}")
