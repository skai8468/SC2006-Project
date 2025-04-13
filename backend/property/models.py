from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import JSONField 

from account.models import User

def validate_non_negative(value):
    if value < 0:
        raise ValidationError("This field must be 0 or greater.")

class Property(models.Model):
    PROPERTY_TYPES = [
        ('HDB', 'HDB'),
        ('Condo', 'Condo'),
        ('Landed', 'Landed'),
        # ('Apartment', 'Apartment'),
        # ('Penthouse', 'Penthouse'),
        ('Studio', 'Studio'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('sold', 'Sold'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_properties', default=None)
    title = models.CharField(max_length=100, blank=False, null=False, default="Property Listing")
    block = models.CharField(max_length=20, blank=True, null=True)  # e.g., "460 - 530"
    street_name = models.CharField(max_length=100, blank=False, null=False)  # e.g., "Lorong 6 Toa Payoh"
    location = models.CharField(max_length=100, blank=False, null=False)  # e.g., "460 Lorong 6 Toa Payoh"
    town = models.CharField(max_length=50, blank=True, null=True)  # e.g., "Toa Payoh"
    city = models.CharField(max_length=50, default="Singapore", blank=False, null=False)  # Default to Singapore
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
    bedrooms = models.IntegerField(default=0, validators=[validate_non_negative])
    bathrooms = models.IntegerField(default=0, validators=[validate_non_negative])
    square_feet = models.IntegerField(default=0, validators=[validate_non_negative])
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES, default='HDB')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    amenities = models.JSONField(default=dict)
    description = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=20, decimal_places=14, blank=True, null=True)
    longitude = models.DecimalField(max_digits=20, decimal_places=14, blank=True, null=True)
    # image = models.ImageField(upload_to='property_images/', blank=True, null=True)
    # video_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


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
        return self.title
    

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='property_images/')
    created_at = models.DateTimeField(auto_now_add=True)

# property request
class PropertyRequest(models.Model):
    REQUEST_TYPE_CHOICES = [
        ('new', 'New Property'),
        ('update', 'Update Existing Property'),
    ]
    # Optional: if the property already exists, the admin can link to it;
    # for new properties, this can remain null.
    property = models.ForeignKey(Property, on_delete=models.CASCADE, null=True, blank=True)
    
    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='property_requests', default=None)
    created_at = models.DateTimeField(auto_now_add=True)

    # Snapshot fields for new property requests.
    title = models.CharField(max_length=100, blank=True, null=True)
    block = models.CharField(max_length=20, blank=True, null=True)
    street_name = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    town = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, default="Singapore", blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    bedrooms = models.IntegerField(blank=True, null=True)
    bathrooms = models.IntegerField(blank=True, null=True)
    square_feet = models.IntegerField(blank=True, null=True)
    property_type = models.CharField(
        max_length=20,
        choices=Property.PROPERTY_TYPES,  # Assuming these choices are defined in Property.
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=Property.STATUS_CHOICES,  # Assuming these choices are defined in Property.
        blank=True,
        null=True
    )
    amenities = models.JSONField(default=dict, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=20, decimal_places=14, blank=True, null=True)
    longitude = models.DecimalField(max_digits=20, decimal_places=14, blank=True, null=True)
    
    request_type = models.CharField(
        max_length=20,
        choices=REQUEST_TYPE_CHOICES,
        default='new',
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Property Request'
        verbose_name_plural = 'Property Requests'

    def clean(self):
        # If a property is linked, ensure the user is not requesting their own property.
        if self.property and self.user == self.property.owner:
            raise ValidationError("You cannot request your own property.")

    def save(self, *args, **kwargs):
        # Optionally, if a property is linked, automatically populate the snapshot fields.
        # Only auto-populate snapshot fields for new property requests
        if self.request_type == 'new' and self.property:
            self.title = self.property.title
            self.block = self.property.block
            self.street_name = self.property.street_name
            self.location = self.property.location
            self.town = self.property.town
            self.city = self.property.city
            self.zip_code = self.property.zip_code
            self.price = self.property.price
            self.bedrooms = self.property.bedrooms
            self.bathrooms = self.property.bathrooms
            self.square_feet = self.property.square_feet
            self.property_type = self.property.property_type
            self.status = self.property.status
            self.amenities = self.property.amenities
            self.description = self.property.description
            self.latitude = self.property.latitude
            self.longitude = self.property.longitude
        # For update request, do not override the snapshot fields.
        super().save(*args, **kwargs)

    def __str__(self):
        snapshot_title = self.property.title if self.property else self.title or "Unknown Property"
        return f"Request for {snapshot_title} by {self.user.username}"
    
class PropertyRequestImage(models.Model):
    property = models.ForeignKey(PropertyRequest, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='property_request_images/')
    created_at = models.DateTimeField(auto_now_add=True)