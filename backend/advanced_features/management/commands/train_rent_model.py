from django.core.management.base import BaseCommand
from advanced_features.rent_model import train_model

class Command(BaseCommand):
    help = "Train the rent prediction model and save the trained pipeline"
    
    def add_arguments(self, parser):
        parser.add_argument(
            'data_path',
            type=str,
            help="Path to the CSV file containing the training data"
        )
    def handle(self, *args, **options):
        data_path = options['data_path']
        self.stdout.write("Training model using data from: " + data_path)
        train_model(data_path)
        self.stdout.write(self.style.SUCCESS("Model training completed and saved"))