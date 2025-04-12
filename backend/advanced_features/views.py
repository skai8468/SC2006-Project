from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from advanced_features.rent_model import predict_rent


import datetime
from django.utils import timezone

class RentingPredictionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request, *args, **kwargs):
        """
        Expects a JSON payload with the following keys:
        {
            "town": "TAMPINES",
            "flat_type": "3-ROOM",
            "year": 2025,
            "month": 5
        }
        """
        
        data = request.data
        try:
            features = [
                data['town'],
                data['flat_type'],
                data['year'],
                data['month']
            ]
            predicted_rent = predict_rent(features)
            return Response({"predicted_rent": predicted_rent}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
# prediction for 12 months from the time of request
class RentingPrediction12MonthsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    request_body = openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["town", "flat_type"],
        properties={
            "town": openapi.Schema(type=openapi.TYPE_STRING, description="Town e.g., TAMPINES"),
            "flat_type": openapi.Schema(type=openapi.TYPE_STRING, description="Flat type e.g., 3-ROOM"),
        },
    )

    @swagger_auto_schema(
        request_body=request_body,
        responses={200: openapi.Response('Predicted rents', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "predicted_rent": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_NUMBER)
                )
            }
        ))}
    )
    
    def post(self, request, *args, **kwargs):
        """
        Expects a JSON payload with the following keys:
        {
            "town": "TAMPINES",
            "flat_type": "3-ROOM",
        }
        """
        
        data = request.data
        try:
            features = [
                data['town'],
                data['flat_type'],
                # the current year/month
                timezone.now().year,
                timezone.now().month
            ]
            predicted_rent = []
            for i in range(12):
                features[3] += 1
                if features[3] > 12:
                    features[3] = 1
                    features[2] += 1
                predicted_rent.append(predict_rent(features))
            return Response({"predicted_rent": predicted_rent}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        