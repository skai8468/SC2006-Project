from django.db import models
from django.core.exceptions import ValidationError

def validate_non_negative(value):
    if value < 0:
        raise ValidationError("This field must be 0 or greater.")

class Property(models.Model):
    block = models.CharField(max_length=20, blank=True, null=True)  # e.g., "460 - 530"
    street_name = models.CharField(max_length=100, blank=False, null=False)  # e.g., "Lorong 6 Toa Payoh"
    town = models.CharField(max_length=50, blank=True, null=True)  # e.g., "Toa Payoh"
    city = models.CharField(max_length=50, default="Singapore", blank=False, null=False)  # Default to Singapore
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
    bedrooms = models.IntegerField(default=0, validators=[validate_non_negative])
    bathrooms = models.IntegerField(default=0, validators=[validate_non_negative])
    square_feet = models.IntegerField(default=0, validators=[validate_non_negative])