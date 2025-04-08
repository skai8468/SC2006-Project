import requests
from django.conf import settings
from .models import RentalFlat, ResaleFlat
from django.db import transaction
from datetime import datetime

class DataGovSGClient:
    BASE_URL = "https://data.gov.sg/api/action/"
    
    def get_dataset(self, dataset_id, limit=None, filters=None):
        params = {'resource_id': dataset_id}
        if limit:
            params['limit'] = limit
        if filters:
            params['filters'] = str(filters)
        
        response = requests.get(f"{self.BASE_URL}datastore_search", params=params)
        response.raise_for_status()
        return response.json().get('result', {}).get('records', [])

    @transaction.atomic
    def store_rental_data(self, limit=None, filters=None):
        records = self.get_dataset(
            dataset_id="d_c9f57187485a850908655db0e8cfe651",
            limit=limit,
            filters=filters
        )
        
        stored_count = 0
        for record in records:
            _, created = RentalFlat.objects.update_or_create(
                town=record['town'],
                flat_type=record['flat_type'],
                block=record['block'],
                street_name=record['street_name'],
                defaults={
                    'monthly_rent': record['monthly_rent'],
                    'lease_commence_date': record['lease_commence_date'],
                    'remaining_lease': record['remaining_lease']
                }
            )
            if created:
                stored_count += 1
                
        return stored_count

    @transaction.atomic
    def store_resale_data(self, limit=None, filters=None):
        records = self.get_dataset(
            dataset_id="d_8b84c4ee58e3cfc0ece0d773c8ca6abc",
            limit=limit,
            filters=filters
        )
        
        stored_count = 0
        for record in records:
            _, created = ResaleFlat.objects.update_or_create(
                month=record['month'],
                town=record['town'],
                flat_type=record['flat_type'],
                block=record['block'],
                street_name=record['street_name'],
                defaults={
                    'storey_range': record['storey_range'],
                    'floor_area_sqm': record['floor_area_sqm'],
                    'flat_model': record['flat_model'],
                    'lease_commence_date': record['lease_commence_date'],
                    'remaining_lease': record['remaining_lease'],
                    'resale_price': record['resale_price']
                }
            )
            if created:
                stored_count += 1
                
        return stored_count