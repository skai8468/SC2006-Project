from django.shortcuts import render
from rest_framework import generics

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .serializer import *

class PropertyView(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

# view a single property using the property id
class PropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        return Property.objects.filter(id=self.kwargs['pk'])