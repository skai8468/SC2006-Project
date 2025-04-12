import csv
import io
import requests
from django.core.management.base import BaseCommand
from data_management.models import RentalFlat

class Command(BaseCommand):
    help = 'Fetches rental flat data directly from Data.gov.sg (in-memory CSV)'

    def handle(self, *args, **kwargs):
        dataset_id = "d_c9f57187485a850908655db0e8cfe651"

        try:
            self.stdout.write('Fetching dataset metadata...')
            response = requests.get(
                f"https://api-open.data.gov.sg/v1/public/api/datasets/{dataset_id}/initiate-download",
                headers={"Content-Type": "application/json"},
                json={}
            )
            response.raise_for_status()

            data = response.json()
            download_url = data['data']['url']
            self.stdout.write(f'Downloading from: {download_url}')

            self.stdout.write('Fetching CSV content...')
            csv_response = requests.get(download_url)
            csv_response.raise_for_status()

            file_stream = io.StringIO(csv_response.content.decode('utf-8'))
            reader = csv.DictReader(file_stream)

            created_count = 0
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

            self.stdout.write(self.style.SUCCESS(
                f'Successfully processed {created_count} rental flat records.'
            ))

        except Exception as e:
            self.stderr.write(f"Error: {str(e)}")
