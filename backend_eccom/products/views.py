from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification

from .models import Product
from .serializers import (
    CategoriesResponseSerializer,
    OptionsResponseSerializer,
    ProductSerializer,
)


def choices_to_options(choices):
    """Turn Django choices into [{"label": ..., "value": ...}, ...]."""
    return [{"label": label, "value": value} for value, label in choices]


def delete_file_quietly(field_file_or_storage, name=None):
    """
    Remove an uploaded file from disk.

    Cleanup must never break the request: on Windows a file that is still open
    (e.g. being downloaded) cannot be deleted, so errors are ignored.
    """
    try:
        if name is None:
            field_file_or_storage.delete(save=False)
        else:
            field_file_or_storage.delete(name)
    except OSError:
        pass


@extend_schema(tags=["Products"])
class ProductViewSet(viewsets.ModelViewSet):
    """
    Product CRUD.

    GET    /api/products/        list all products
    POST   /api/products/        create (JSON, or multipart/form-data with files)
    GET    /api/products/{id}/   product details
    PUT    /api/products/{id}/   full update
    PATCH  /api/products/{id}/   partial update
    DELETE /api/products/{id}/   delete
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def perform_create(self, serializer):
        product = serializer.save()
        Notification.objects.create(
            title="New Product",
            message=f'"{product.name}" has been added to the store.',
        )

    def perform_update(self, serializer):
        # When a new image/file replaces an old one, remove the old file from disk.
        old_image = serializer.instance.image.name if serializer.instance.image else None
        old_file = serializer.instance.product_file.name if serializer.instance.product_file else None

        product = serializer.save()

        if old_image and old_image != (product.image.name if product.image else None):
            delete_file_quietly(product.image.storage, old_image)
        if old_file and old_file != (product.product_file.name if product.product_file else None):
            delete_file_quietly(product.product_file.storage, old_file)

    def perform_destroy(self, instance):
        # Delete uploaded files from disk together with the database row.
        image, product_file = instance.image, instance.product_file
        instance.delete()
        if image:
            delete_file_quietly(image)
        if product_file:
            delete_file_quietly(product_file)


@extend_schema(tags=["Options"], responses=CategoriesResponseSerializer)
class CategoryListView(APIView):
    """GET /api/categories/ - category options for a dropdown."""

    def get(self, request):
        return Response({"categories": choices_to_options(Product.Category.choices)})


@extend_schema(tags=["Options"], responses=OptionsResponseSerializer)
class OptionsView(APIView):
    """GET /api/options/ - all options a product form needs (dropdown + radio buttons)."""

    def get(self, request):
        return Response(
            {
                "categories": choices_to_options(Product.Category.choices),
                "conditions": choices_to_options(Product.Condition.choices),
            }
        )
