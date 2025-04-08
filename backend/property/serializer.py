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
        }

# property request serializer
class PropertyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyRequest
        fields = '__all__'

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image']