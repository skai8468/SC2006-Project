from rest_framework import generics
from django.db import models
from property.models import Property
from property.serializer import PropertySerializer

class PropertySearchView(generics.ListAPIView):
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        queryset = Property.objects.all()
        
        # Get search parameters from query string
        search_query = self.request.query_params.get('search')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        bedrooms = self.request.query_params.get('bedrooms')
        bathrooms = self.request.query_params.get('bathrooms')
        property_type = self.request.query_params.get('type')
        amenities = self.request.query_params.get('amenities')
        
        # Apply filters
        if search_query:
            queryset = queryset.filter(
                models.Q(title__icontains=search_query) |
                models.Q(location__icontains=search_query) |
                models.Q(address__icontains=search_query) |
                models.Q(city__icontains=search_query) |
                models.Q(state__icontains=search_query) |
                models.Q(zip_code__icontains=search_query)
            )
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        if bedrooms:
            queryset = queryset.filter(bedrooms__gte=bedrooms)
            
        if bathrooms:
            queryset = queryset.filter(bathrooms__gte=bathrooms)
            
        if property_type:
            queryset = queryset.filter(property_type__iexact=property_type)
            
        if amenities:
            amenity_list = [a.strip() for a in amenities.split(',')]
            for amenity in amenity_list:
                queryset = queryset.filter(amenities__icontains=amenity)
                
        return queryset.order_by('-created_at')