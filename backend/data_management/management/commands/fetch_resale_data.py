from django.core.management.base import BaseCommand
from data_management.models import ResaleFlat
import requests

class Command(BaseCommand):
    help = 'Fetches resale flat data from Data.gov.sg API'

    def handle(self, *args, **options):
        dataset_id = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc"
        url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                records = data.get('result', {}).get('records', [])
                processed = 0
                
                for record in records:
                    try:
                        floor_area = float(record.get('floor_area_sqm', 0))
                        resale_price = float(record.get('resale_price', 0))
                        lease_commence = int(record.get('lease_commence_date', 0))
                    except (TypeError, ValueError):
                        continue 
                    
                    ResaleFlat.objects.update_or_create(
                        month=record.get('month'),
                        block=record.get('block'),
                        street_name=record.get('street_name'),
                        defaults={
                            'town': record.get('town'),
                            'flat_type': record.get('flat_type'),
                            'storey_range': record.get('storey_range'),
                            'floor_area_sqm': floor_area,
                            'flat_model': record.get('flat_model'),
                            'lease_commence_date': lease_commence,
                            'remaining_lease': record.get('remaining_lease'),
                            'resale_price': resale_price,
                        }
                    )
                    processed += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully processed {processed} resale records')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('API request was not successful')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error fetching data: {str(e)}')
            )