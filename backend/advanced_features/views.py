from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from advanced_features.rent_model import predict_rent

class RentingPredictionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request, *args, **kwargs):
        """
        Expects a JSON payload with the following keys:
        {
            "town": "TAMPINES",
            "flat_type": "3-room",
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
        