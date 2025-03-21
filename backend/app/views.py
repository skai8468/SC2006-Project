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
    serializer_class = PropertySerializer


def check_base_dir(request):
    return HttpResponse(f"BASE_DIR: {settings.BASE_DIR}")
