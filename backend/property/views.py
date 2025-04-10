from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from django.shortcuts import render

from .models import *
from .serializer import *

class TokenVerifyView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure that only authenticated users can access this view

    def get(self, request):
        return Response({"message": "Token is valid."}, status=status.HTTP_200_OK)
    

class PropertyImageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_id):
        try:
            property = Property.objects.get(id=property_id)

            # Check if the user is the owner of the property
            if property.owner != request.user:
                return Response({'message': 'You do not have permission to upload images for this property'},
                                status=status.HTTP_403_FORBIDDEN)

            # Handle multiple image uploads
            images = request.FILES.getlist('images')
            for image in images:
                PropertyImage.objects.create(property=property, image=image)

            return Response({'message': 'Images uploaded successfully'}, status=status.HTTP_201_CREATED)
        
        except Property.DoesNotExist:
            return Response({'message': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
    
class PropertyView(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        print("Fetching properties...")
        return super().get_queryset().order_by('-created_at')

# view a single property using the property id
class PropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Property.objects.none()
        pk = self.kwargs.get('pk')
        return Property.objects.filter(id=pk)
    
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
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            property = serializer.save(owner=request.user)
            return Response({
                "message": "Property created successfully",
                "property": serializer.data,
                "id": property.id  # Ensure ID is returned for image upload
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "message": str(e),
                "errors": serializer.errors if hasattr(serializer, 'errors') else None
            }, status=status.HTTP_400_BAD_REQUEST)

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