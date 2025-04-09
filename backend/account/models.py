from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=50, blank=False, null=False)
    favorite_properties = models.ManyToManyField(
        'property.Property',
        related_name='favorited_by',
        blank=True,
    )

    # Add related_name to avoid clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='related_groups',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='related_permissions',
        blank=True,
    )