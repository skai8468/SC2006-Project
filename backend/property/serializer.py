from rest_framework import serializers
from .models import *
        
class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'
        
class UpdatePropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'
        extra_kwargs = {
            'title': {'required': False},
            'block': {'required': False},
            'street_name': {'required': False},
            'town': {'required': False},
            'city': {'required': False},
            'zip_code': {'required': False},
            'price': {'required': False},
            'bedrooms': {'required': False},
            'bathrooms': {'required': False},
            'square_feet': {'required': False},
            'property_type': {'required': False},
            'status': {'required': False},
            'amenities': {'required': False},
            'description': {'required': False},
            'latitude': {'required': False},
            'longitude': {'required': False},
        }

# property request serializer
class PropertyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'user']

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image']
        
class UpdatePropertyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyRequest
        fields = '__all__'
        extra_kwargs = {
            'property': {'required': False},
            'title': {'required': False},
            'block': {'required': False},
            'street_name': {'required': False},
            'location': {'required': False},
            'town': {'required': False},
            'city': {'required': False},
            'zip_code': {'required': False},
            'price': {'required': False},
            'bedrooms': {'required': False},
            'bathrooms': {'required': False},
            'square_feet': {'required': False},
            'property_type': {'required': False},
            'status': {'required': False},
            'amenities': {'required': False},
            'description': {'required': False},
            'latitude': {'required': False},
            'longitude': {'required': False},
        }
        read_only_fields = ['created_at', 'user']