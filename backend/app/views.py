from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from .serializer import *

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.conf import settings

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    
@api_view(['GET', 'POST'])
def get_account(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.data, status=400)
    elif request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    else:
        pass

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            latest_user = User.objects.last()
            user = User(
                username=data['username'],
                password=data['password'],
                email=data['email'],
                first_name=data['first_name'],
                last_name=data['last_name'],
            )
            User.save()  # Specify the database to use

            return JsonResponse({'status': 'success', 'message': 'User created successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def delete_user(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            account_id = data.get('account_id')
            if account_id:
                account = User.objects.get(account_id=account_id)
                account.delete()
                return JsonResponse({'status': 'success', 'message': 'User deleted successfully', 'account_id': account_id})
            else:
                return JsonResponse({'status': 'error', 'message': 'Nothing to delete'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_input(request, user_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            current_user_id = data.get('user_id')
            return JsonResponse({'status': 'success', 'message': 'User Input', 'user_id': current_user_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@csrf_exempt
def delete_latest_entry(request):
    if request.method == 'DELETE':
        try:
            latest_entry = User.objects.last()
            if latest_entry: 
                latest_entry.delete()
                return JsonResponse({'status': 'success', 'message': 'Latest entry deleted'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Nothing to delete'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def delete_all_entry(request):
    if request.method == 'DELETE':
        try:
            count, _ = User.objects.all().delete()
            if count > 0:
                return JsonResponse({'status': 'success', 'message': f'{count} entries deleted'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Nothing to delete'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def check_base_dir(request):
    return HttpResponse(f"BASE_DIR: {settings.BASE_DIR}")