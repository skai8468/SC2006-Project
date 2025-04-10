from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.core.exceptions import ValidationError

class RentalFlat(models.Model):
    rent_approval_date = models.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r'^\d{4}-(0[1-9]|1[0-2])$',
                message='Date must be in YYYY-MM format'
            )
        ]
    )
    town = models.CharField(max_length=50)
    block = models.CharField(max_length=10)
    street_name = models.CharField(max_length=100)
    flat_type = models.CharField(max_length=20)
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    class Meta:
        verbose_name = "Rental Flat"
        verbose_name_plural = "Rental Flats"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.block} {self.street_name} - {self.flat_type} (Approved: {self.rent_approval_date})"
        return f"Record {self.record_id}"

class ResaleFlat(models.Model):
    month = models.CharField(max_length=7)  # YYYY-MM format
    town = models.CharField(max_length=50)
    flat_type = models.CharField(max_length=20)
    block = models.CharField(max_length=10)
    street_name = models.CharField(max_length=100)
    storey_range = models.CharField(max_length=20)
    floor_area_sqm = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    flat_model = models.CharField(max_length=50)
    lease_commence_date = models.IntegerField()  # Year only
    remaining_lease = models.CharField(max_length=50)
    resale_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resale Flat"
        verbose_name_plural = "Resale Flats"
        ordering = ['-month']
        unique_together = ['month', 'block', 'street_name']

    def __str__(self):
        return f"{self.block} {self.street_name} - {self.flat_type} (${self.resale_price})"
    

class Flat(models.Model):
    town = models.CharField(max_length=50)
    block = models.CharField(max_length=10)
    street_name = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=6, blank=True, null=True)
    flat_type = models.CharField(max_length=20)
    storey_range = models.CharField(max_length=20, blank=True, null=True)
    floor_area_sqm = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True
    )
    flat_model = models.CharField(max_length=50, blank=True, null=True)
    lease_commence_date = models.IntegerField(blank=True, null=True)  # Year only
    remaining_lease = models.CharField(max_length=50, blank=True, null=True)

    for_rent = models.BooleanField(default=False)
    for_sale = models.BooleanField(default=False)

    rent_approval_date = models.CharField(
        max_length=7,
        validators=[
            RegexValidator(
                regex=r'^\d{4}-(0[1-9]|1[0-2])$',
                message='Date must be in YYYY-MM format'
            )
        ],
        blank=True,
        null=True
    )
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True
    )

    resale_date = models.CharField(max_length=7, blank=True, null=True)  # YYYY-MM format
    resale_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Flat"
        verbose_name_plural = "Flats"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['for_rent']),
            models.Index(fields=['for_sale']),
            models.Index(fields=['town']),
            models.Index(fields=['flat_type']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(for_rent=True) | models.Q(for_sale=True),
                name='at_least_one_purpose'
            ),
            models.CheckConstraint(
                check=~models.Q(for_rent=True, for_sale=True),
                name='mutually_exclusive_purpose'
            )
        ]

    def __str__(self):
        if self.for_rent:
            return f"{self.block} {self.street_name} - {self.flat_type} (Rental: ${self.monthly_rent})"
        return f"{self.block} {self.street_name} - {self.flat_type} (Resale: ${self.resale_price})"

    def clean(self):
        if self.for_rent and self.for_sale:
            raise ValidationError("A flat cannot be both for rent and for sale simultaneously")
        
        if self.for_rent:
            if not self.rent_approval_date or not self.monthly_rent:
                raise ValidationError("Rental flats require approval date and monthly rent")
        
        if self.for_sale:
            if not self.resale_date or not self.resale_price:
                raise ValidationError("Resale flats require resale date and price")