# ONEMAP_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlNzk3YzFmMThkODAwMWM2NjAzYjIwN2I5YmEzNjExYSIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC1uZXctMTYzMzc5OTU0Mi5hcC1zb3V0aGVhc3QtMS5lbGIuYW1hem9uYXdzLmNvbS9hcGkvdjIvdXNlci9wYXNzd29yZCIsImlhdCI6MTc0NDAyMTQ4OSwiZXhwIjoxNzQ0MjgwNjg5LCJuYmYiOjE3NDQwMjE0ODksImp0aSI6InZMZFh0MGV0a0NNN1d3SXYiLCJ1c2VyX2lkIjo2NzQxLCJmb3JldmVyIjpmYWxzZX0.LOtHFfmbDaslpqbN4k8dgDT4iD0msKwYBjxRzwTeGuc'
# ONEMAP_API_URL = 'https://www.onemap.gov.sg/api/common/elastic/search'

from django.core.management.base import BaseCommand
from django.db import transaction
from data_management.models import RentalFlat, ResaleFlat, Flat
import time

class Command(BaseCommand):
    help = 'Merges RentalFlat and ResaleFlat into Flat table'
    
    def handle(self, *args, **options):
        start_time = time.time()
        stats = {'rentals': 0, 'resales': 0}
        
        with transaction.atomic():
            self.stdout.write("Merging rental flats...")
            for rental in RentalFlat.objects.all().iterator():
                Flat.objects.update_or_create(
                    for_rent=True,
                    block=rental.block,
                    street_name=rental.street_name,
                    rent_approval_date=rental.rent_approval_date,
                    defaults={
                        'town': rental.town,
                        'flat_type': rental.flat_type,
                        'monthly_rent': rental.monthly_rent,
                        'created_at': rental.created_at,
                        'updated_at': rental.updated_at
                    }
                )
                stats['rentals'] += 1
            
            self.stdout.write("\nMerging resale flats...")
            for resale in ResaleFlat.objects.all().iterator():
                Flat.objects.update_or_create(
                    for_sale=True,
                    block=resale.block,
                    street_name=resale.street_name,
                    resale_date=resale.month,
                    defaults={
                        'town': resale.town,
                        'flat_type': resale.flat_type,
                        'storey_range': resale.storey_range,
                        'floor_area_sqm': resale.floor_area_sqm,
                        'flat_model': resale.flat_model,
                        'lease_commence_date': resale.lease_commence_date,
                        'remaining_lease': resale.remaining_lease,
                        'resale_price': resale.resale_price,
                        'created_at': resale.created_at,
                        'updated_at': resale.updated_at
                    }
                )
                stats['resales'] += 1
        
        total_time = time.time() - start_time
        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully merged {stats['rentals']} rentals and {stats['resales']} resales "
                f"in {total_time:.2f} seconds"
            )
        )