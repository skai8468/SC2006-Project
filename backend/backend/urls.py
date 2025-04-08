from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static

# schema view for swagger
schema_view = get_schema_view(
    openapi.Info(
        title="Backend API",
        default_version='v1',
        description="API for the backend",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="thangitcbg@gmail.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('admin/', admin.site.urls),
    path('account/', include('account.urls')),
    path('property/', include('property.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
