from rest_framework import serializers
from .models import *
        
class PropertySerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'
    
    def get_images(self, obj):
        request = self.context.get('request')
        images = obj.images.all()
        image_urls = []

        for image in images:
            image_url = request.build_absolute_uri(image.image.url)
            print(f"Image URL: {image_url}")
            image_urls.append(image_url)

        return image_urls
        
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
    # images = serializers.SerializerMethodField()
    class Meta:
        model = PropertyRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'user']
        extra_kwargs = {
            'user': {'read_only': True},
        }

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        request = self.context.get('request')
        user = request.user if request else None

        validated_data['user'] = self.context['request'].user

        property_request = super().create(validated_data)

        for image in images:
            PropertyRequestImage.objects.create(property=property_request, image=image)

        return property_request

    def get_images(self, obj):
        request = self.context.get('request')
        images = obj.images.all()
        image_urls = []

        for image in images:
            image_url = request.build_absolute_uri(image.image.url)
            print(f"Image URL: {image_url}")
            image_urls.append(image_url)
            
        return image_urls

class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'created_at', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url)
        
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
