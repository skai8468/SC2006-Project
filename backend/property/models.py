from django.db import models
from django.core.exceptions import ValidationError

from account.models import User

def validate_non_negative(value):
    if value < 0:
        raise ValidationError("This field must be 0 or greater.")

class Property(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties_owned', default=None)
    title = models.CharField(max_length=100, blank=False, null=False, default="Property Listing")
    block = models.CharField(max_length=20, blank=True, null=True)  # e.g., "460 - 530"
    street_name = models.CharField(max_length=100, blank=False, null=False)  # e.g., "Lorong 6 Toa Payoh"
    town = models.CharField(max_length=50, blank=True, null=True)  # e.g., "Toa Payoh"
    city = models.CharField(max_length=50, default="Singapore", blank=False, null=False)  # Default to Singapore
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
    bedrooms = models.IntegerField(default=0, validators=[validate_non_negative])
    bathrooms = models.IntegerField(default=0, validators=[validate_non_negative])
    square_feet = models.IntegerField(default=0, validators=[validate_non_negative])

# property request
class PropertyRequest(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Request for {self.property.title} by {self.user.username}"
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Property Request'
        verbose_name_plural = 'Property Requests'
    def save(self, *args, **kwargs):
        if self.user == self.property.owner:
            raise ValidationError("You cannot request your own property.")
        super().save(*args, **kwargs)
    def clean(self):
        if self.user == self.property.owner:
            raise ValidationError("You cannot request your own property.")
    def __str__(self):
        return f"Request for {self.property.title} by {self.user.username}"