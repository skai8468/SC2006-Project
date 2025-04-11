from django.contrib import admin
from .models import *

admin.site.register(Property)
admin.site.register(PropertyRequest)
admin.site.register(PropertyImage)