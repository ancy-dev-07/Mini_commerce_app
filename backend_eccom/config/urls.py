"""
Root URL configuration for the Mini Product Store backend.

API endpoints:
    /api/products/            /api/products/{id}/
    /api/categories/          /api/options/
    /api/cart/                /api/cart/{id}/
    /api/notifications/       /api/notifications/{id}/

Documentation:
    /api/docs/    Swagger UI
    /api/redoc/   ReDoc
    /api/schema/  Raw OpenAPI schema (YAML)
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # App APIs
    path("api/", include("products.urls")),
    path("api/", include("cart.urls")),
    path("api/", include("notifications.urls")),
    # Swagger / OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Serve uploaded media files during local development only.
# In production a web server (e.g. Nginx) or cloud storage serves media instead.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
