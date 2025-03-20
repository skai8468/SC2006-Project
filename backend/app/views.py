from django.shortcuts import render
from rest_framework import generics

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import *
from .serializer import *

class PropertyView(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer