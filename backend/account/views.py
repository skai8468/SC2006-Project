from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404

from .models import *
from .serializer import *

from property.models import Property
from property.serializer import PropertySerializer

# view all users
class UsersListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# view profile of a user with a specific username    
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    lookup_field = 'username'
    
    def get_object(self):
        username = self.kwargs.get('username')
        return get_object_or_404(User, username=username)

# register a new user
class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterUserSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                    "message": "User registered successfully", 
                    "username": user.username,
                    "email": user.email,
                    "name": user.name,
                    "redirect_to": "/login/"    # redirect to login page *frontend handling*
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# update a user's profile
class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_object(self):
        return self.request.user
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

# delete a user's profile
class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_object(self):
        return self.request.user
    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

# login a user
class LoginUserView(generics.GenericAPIView):
    serializer_class = UserSerializer
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "message": "Login successful"}, status=200)
        return Response({"message": "Invalid credentials"}, status=400)
    
# logout a user
class LogoutUserView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Logout successful"}, status=200)
    
# view all properties of a user
class UserPropertiesView(generics.ListAPIView):
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username)
        return Property.objects.filter(owner=user)
    
class CurrentUserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_object(self):
        print("Fetching current user profile...")
        return self.request.user

# view all favorite properties of a user
class UserFavoritePropertiesView(generics.ListAPIView):
    serializer_class = PropertySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            print("User is not authenticated")
            return Property.objects.none()
        user_fav_properties = user.favorite_properties.all()
        
        print("User favorite properties:", user_fav_properties)
        
        return user_fav_properties
    
# add a property to favorites
class AddToFavoritesView(generics.GenericAPIView):
    serializer_class = PropertySerializer
    
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        property_id = request.data.get('property_id')
        
        if not property_id:
            return Response({"message": "Property ID is required"}, status=400)
        
        try:
            property_instance = Property.objects.get(id=property_id)
            user.favorite_properties.add(property_instance)
            return Response({"message": "Property added to favorites"}, status=200)
        except Property.DoesNotExist:
            return Response({"message": "Property not found"}, status=404)

# remove a property from favorites
class RemoveFromFavoritesView(generics.GenericAPIView):
    serializer_class = PropertySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        property_id = request.data.get('property_id')
        if not property_id:
            return Response({"message": "Property ID is required"}, status=400)
        
        try:
            property_instance = Property.objects.get(id=property_id)
            
            # check user has the property in favorites
            if not user.favorite_properties.filter(id=property_id).exists():
                return Response({"message": "Property not found in favorites"}, status=404)
            user.favorite_properties.remove(property_instance)
            
            return Response({"message": "Property removed from favorites"}, status=200)
        # except the property does not exist or the user does not have it in favorites
        except Property.DoesNotExist:
            return Response({"message": "Property not found in favorites"}, status=404)
        
