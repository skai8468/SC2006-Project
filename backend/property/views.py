from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser


from django.shortcuts import get_object_or_404, render

from .models import *
from .serializer import *

import os
class TokenVerifyView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure that only authenticated users can access this view

    def get(self, request):
        # return Response({"message": "Token is valid."}, status=status.HTTP_200_OK)
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        })

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

            return Response({
                'message': 'Images uploaded successfully',
                'property_id': property.id,
                'images': [img.image.url for img in PropertyImage.objects.filter(property=property)]
            }, status=status.HTTP_201_CREATED)

        except Property.DoesNotExist:
            return Response({'message': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
    
# Upload to property request image table
class PropertyRequestImageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_request_id):
        try:
            property_request = PropertyRequest.objects.get(id=property_request_id)

            # Check if the user is the owner of the property
            if request.user != property_request.user:
                return Response(
                    {'message': 'You do not have permission to upload images for this request'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Handle multiple image uploads
            images = request.FILES.getlist('images')
            if not images:
                return Response(
                    {'message': 'No images provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            for image in images:
                PropertyRequestImage.objects.create(
                    property=property_request,
                    image=image
                )

            print("Property Request Image: ", PropertyRequestImage.objects.filter(property=property_request))
            print("id: ", property_request.id)

            return Response({
                'message': 'Images uploaded successfully',
                'property_request_id': property_request.id,
                'image_urls': [
                    request.build_absolute_uri(img.image.url) 
                    for img in property_request.images.all()
                ]
            }, status=status.HTTP_201_CREATED)

        except Property.DoesNotExist:
            return Response(
                {'message': 'Property request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
# view all properties
class PropertyListView(generics.ListAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        print("Fetching properties...")
        return super().get_queryset().order_by('-created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def list(self, request, *args, **kwargs):
        # Fetch properties
        properties = self.get_queryset()
        serializer = self.get_serializer(properties, many=True)
        
        # Debugging: Print the serialized data to check if images are included
        print("Serialized Properties Data:", serializer.data)
        
        return Response(serializer.data)

# view a single property using the property id
class PropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PropertySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Property.objects.none()
        pk = self.kwargs.get('pk')
        return Property.objects.filter(id=pk)
    
    def get_serializer_context(self):
        return {'request': self.request}
    
class PropertyDeleteView(generics.DestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user != instance.owner:
            return Response({
                "message": "You are not authorized to delete this property"
            }, status=status.HTTP_403_FORBIDDEN)
        
        for image in instance.images.all():
            if image.image and os.path.isfile(image.image.path):
                os.remove(image.image.path)
            image.delete()

        self.perform_destroy(instance)
        return Response({
            "message": "Property deleted successfully"
        }, status=status.HTTP_200_OK)

class UserPropertiesView(generics.ListAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        owner_id = self.request.query_params.get('owner_id', None)
        queryset = Property.objects.all().order_by('-created_at')
        print("Fetching properties for user...")
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
            print("Fetching properties for owner_id:", owner_id)
        return queryset

class PropertyDeleteView(generics.DestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def delete(self, request, pk):
        try:
            property = Property.objects.get(pk=pk)
            # check if the user is the owner of the property
            if property.owner != request.user:
                return Response({'message': 'You do not have permission to delete this property'},
                                status=status.HTTP_403_FORBIDDEN)
            property.delete()
            return Response({'message': 'Property deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Property.DoesNotExist:
            return Response({'message': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)
    
# request to create a new property
class CreatePropertyRequestView(generics.CreateAPIView):
    queryset = PropertyRequest.objects.all()
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        try:
            if serializer.is_valid():
                propertyRequest = serializer.save(user=request.user)
                return Response({
                    "message": "Property request created successfully",
                    "property_request": serializer.data,
                    "id": propertyRequest.id,
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# request for updating a property
class UpdatePropertyRequestView(generics.CreateAPIView):
    queryset = PropertyRequest.objects.all()
    serializer_class = UpdatePropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def create(self, request, *args, **kwargs):
        # check if the request user is the owner of the property
        property_id = request.data.get('property_id')
        try:
            property_obj = Property.objects.get(id=property_id)
            if request.user != property_obj.owner:
                return Response({
                        "message": "You are not authorized to update this property"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        except Property.DoesNotExist:
            return Response({
                    "message": "Property not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            property_request = serializer.save(user=request.user, request_type='update', property=property_obj)
            return Response({
                    "message": "Property update request created successfully",
                    "property_request": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# view all property requests
class PropertyRequestListView(generics.ListAPIView):
    queryset = PropertyRequest.objects.all()
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_queryset(self):
        # check if the user is admin/staff/superuser
        if self.request.user.is_staff or self.request.user.is_superuser:
            print("Fetching all property requests...")
            return PropertyRequest.objects.all()
        else:
            print("Fetching user's property requests...")
            return PropertyRequest.objects.filter(user=self.request.user)
        
# view a single property request
class PropertyRequestDetailView(generics.RetrieveAPIView):
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_queryset(self):
        request = self.request
        property_request = PropertyRequest.objects.filter(id=self.kwargs.get('pk'))
        if not property_request.exists():
            return Response({"message": "Property request not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.is_staff or request.user.is_superuser or request.user == property_request.user:
            return property_request
        else:
            return Response({"message": "You do not have permission to view this request"}, status=status.HTTP_403_FORBIDDEN)

# accept a property request by id (for admin/staff/superuser only)
class AcceptPropertyRequestView(generics.GenericAPIView):
    queryset = PropertyRequest.objects.all()
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request, *args, **kwargs):
        # retrieve the property request by id
        property_request = get_object_or_404(PropertyRequest, id=self.kwargs['pk'])
        
        # check if the user is admin/staff/superuser
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"message": "You do not have permission to accept this request"}, status=403)
        
        # if request type is new, create a new property
        if property_request.request_type == 'new':
            print("Creating new property...")
            # check if the property already exists
            if Property.objects.filter(title=property_request.title, owner=property_request.user).exists():
                return Response({"message": "Property already exists"}, status=status.HTTP_400_BAD_REQUEST)
            # create a new property
            property_data = {
                "owner": property_request.user.id,
                "title": property_request.title,
                "block": property_request.block,
                "street_name": property_request.street_name,
                "location": property_request.location,
                "town": property_request.town,
                "city": property_request.city,
                "zip_code": property_request.zip_code,
                "price": property_request.price,
                "bedrooms": property_request.bedrooms,
                "bathrooms": property_request.bathrooms,
                "square_feet": property_request.square_feet,
                "property_type": property_request.property_type,
                "status": property_request.status,
                "amenities": property_request.amenities,
                "description": property_request.description,
                "latitude": property_request.latitude,
                "longitude": property_request.longitude,
            }
            property_serializer = PropertySerializer(data=property_data)
            if property_serializer.is_valid():
                property_instance = property_serializer.save()
            else:
                return Response(property_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # if request type is update, update the existing property
        else:
            # check if the property exists
            try:
                print("Updating existing property...")
                print(property_request.property)
                property_instance = Property.objects.get(id=property_request.property.id)
                # Build update data from the property_request snapshot
                update_data = {
                    "title": property_request.title or property_instance.title,
                    "block": property_request.block or property_instance.block,
                    "street_name": property_request.street_name or property_instance.street_name,
                    "location": property_request.location or property_instance.location,
                    "town": property_request.town or property_instance.town,
                    "city": property_request.city or property_instance.city,
                    "zip_code": property_request.zip_code or property_instance.zip_code,
                    "price": property_request.price if property_request.price is not None else property_instance.price,
                    "bedrooms": property_request.bedrooms if property_request.bedrooms is not None else property_instance.bedrooms,
                    "bathrooms": property_request.bathrooms if property_request.bathrooms is not None else property_instance.bathrooms,
                    "square_feet": property_request.square_feet if property_request.square_feet is not None else property_instance.square_feet,
                    "property_type": property_request.property_type or property_instance.property_type,
                    "status": property_request.status or property_instance.status,
                    "amenities": property_request.amenities or property_instance.amenities,
                    "description": property_request.description or property_instance.description,
                    "latitude": property_request.latitude if property_request.latitude is not None else property_instance.latitude,
                    "longitude": property_request.longitude if property_request.longitude is not None else property_instance.longitude,
                }
                # Use partial update so that only provided fields are updated
                property_serializer = UpdatePropertySerializer(property_instance, data=update_data, partial=True)
                
                if property_serializer.is_valid():
                    
                    property_instance = property_serializer.save()
                    print("Property Instance: ", property_instance)
                else:
                    return Response(property_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Property.DoesNotExist:
                return Response({"message": "Property not found"}, status=status.HTTP_404_NOT_FOUND)
        # delete the property request
        property_request.delete()
        return Response({"message": "Property request accepted successfully"}, status=status.HTTP_200_OK)

# reject a property request by id (for admin/staff/superuser only)
class RejectPropertyRequestView(generics.GenericAPIView):
    queryset = PropertyRequest.objects.all()
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request, *args, **kwargs):
        # retrieve the property request by id
        property_request = get_object_or_404(PropertyRequest, id=self.kwargs['pk'])
        
        # check if the user is admin/staff/superuser
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({"message": "You do not have permission to reject this request"}, status=403)
        
        for image in PropertyRequestImage.objects.filter(property=property_request):
            if image.image and os.path.isfile(image.image.path):
                os.remove(image.image.path)
            image.delete()
            
        # delete the property request
        property_request.delete()
        return Response({"message": "Property request rejected successfully"}, status=status.HTTP_200_OK)
        