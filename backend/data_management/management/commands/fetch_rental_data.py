from django.core.management.base import BaseCommand
from data_management.models import RentalFlat
import requests
from datetime import datetime

class Command(BaseCommand):
    help = 'Fetches rental flat data from Data.gov.sg API'

    def handle(self, *args, **options):
        dataset_id = "d_c9f57187485a850908655db0e8cfe651"
        url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                records = data.get('result', {}).get('records', [])
                created_count = 0
                
                for record in records:
                    RentalFlat.objects.update_or_create(
                        rent_approval_date=record.get('rent_approval_date'),
                        block=record.get('block'),
                        defaults={
                            'town': record.get('town'),
                            'street_name': record.get('street_name'),
                            'flat_type': record.get('flat_type'),
                            'monthly_rent': record.get('monthly_rent'),
                        }
                    )
                    created_count += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully processed {created_count} records')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('API request was not successful')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error fetching data: {str(e)}')
            )