from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import JSONField 

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
    property_type = models.CharField(max_length=50, choices=[
        ('HDB', 'HDB'),
        ('Condo', 'Condo'),
        ('Landed', 'Landed'),
        ('Studio', 'Studio'),
    ], default='HDB')
    amenities = models.JSONField(default=dict)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='property_images/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)



    def set_default_amenities(self):
        return {
            'wifi': False,
            'aircon': False,
            'parking': False,
            'swimming_pool': False,
            'gym': False,
            'balcony': False,
            'security': False,
            'garden': False,
            'smart_home': False,
            'pet_friendly': False,
            'washing_machine': False,
            'dryer': False,
            'kitchen': False,
        }

    def save(self, *args, **kwargs):
        if not self.amenities:
            self.amenities = self.set_default_amenities()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.video_url:
            return f"Video for {self.property.title}"
        return f"Image for {self.property.title}"

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