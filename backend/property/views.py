from django.shortcuts import render
from rest_framework import generics

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import *
from .serializer import *

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

# view a single property using the property id
class PropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        return Property.objects.filter(id=self.kwargs['pk'])
    
# update a property
class UpdatePropertyView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = UpdatePropertySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # check if the request user is the owner of the property
        if request.user != instance.owner:
            return Response({
                    "message": "You are not authorized to update this property"
                },
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                    "message": "Property updated successfully",
                    "property": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# create a new property
class CreatePropertyView(generics.CreateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            property = serializer.save(owner=request.user)
            return Response({
                    "message": "Property created successfully",
                    "property": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# request to create a new property
class CreatePropertyRequestView(generics.CreateAPIView):
    queryset = PropertyRequest.objects.all()
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            property_request = serializer.save(user=request.user)
            return Response({
                    "message": "Property request created successfully",
                    "property_request": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)