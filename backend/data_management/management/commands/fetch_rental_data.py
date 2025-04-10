from django.core.management.base import BaseCommand
from data_management.models import RentalFlat
import requests
from datetime import datetime
import os
import csv
from django.conf import settings

class Command(BaseCommand):
    help = 'Fetches rental flat data from Data.gov.sg CSV file'

    def handle(self, *args, **options):
        dataset_id = "d_c9f57187485a850908655db0e8cfe651"

        initiate_download_response = s.get(
            f"https://api-open.data.gov.sg/v1/public/api/datasets/{DATASET_ID}/initiate-download",
            headers={"Content-Type":"application/json"},
            json={}
        )
        
        csv_url = f"https://api-open.data.gov.sg/v1/public/api/datasets/{dataset_id}/initiate-download"
        # csv_url = "https://data.gov.sg/dataset//download/rental_flats.csv"
        
        csv_dir = os.path.join(settings.BASE_DIR, 'data_management', 'csv')
        os.makedirs(csv_dir, exist_ok=True)
        csv_path = os.path.join(csv_dir, 'rental_flats.csv')
        
        try:
            self.stdout.write('Downloading CSV file...')
            response = requests.get(csv_url)
            response.raise_for_status()
            
            with open(csv_path, 'wb') as f:
                f.write(response.content)
            self.stdout.write(f'CSV file saved to {csv_path}')
            
            created_count = 0
            with open(csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for record in reader:
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
                    
                    if created_count % 1000 == 0:
                        self.stdout.write(f'Processed {created_count} records...')
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully processed {created_count} records from CSV')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error processing data: {str(e)}')
            )
            if os.path.exists(csv_path):
                os.remove(csv_path)