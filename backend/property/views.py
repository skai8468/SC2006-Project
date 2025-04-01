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