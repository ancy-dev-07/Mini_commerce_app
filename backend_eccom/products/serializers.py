from decimal import Decimal

from django.conf import settings
from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """
    Used for list, detail, create and update.

    - Works with JSON (no files) and multipart/form-data (with image / product_file).
    - `image` and `product_file` are returned as absolute URLs because the
      ViewSet passes the request into the serializer context.
    - `category_label` / `condition_label` are read-only display names.
    """

    # Declared explicitly so validate_price() gives the "greater than 0" message.
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    condition_label = serializers.CharField(source="get_condition_display", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category",
            "category_label",
            "condition",
            "condition_label",
            "image",
            "product_file",
            "stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            # DRF trims whitespace, so "   " also counts as blank.
            "name": {"error_messages": {"blank": "Product name cannot be empty."}},
        }

    def validate_price(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_image(self, value):
        # The extension is checked by the model's FileExtensionValidator and
        # DRF's ImageField checks that the file really is an image (via Pillow).
        if value and value.size > settings.MAX_IMAGE_UPLOAD_SIZE:
            limit_mb = settings.MAX_IMAGE_UPLOAD_SIZE // (1024 * 1024)
            raise serializers.ValidationError(f"Image must be {limit_mb} MB or smaller.")
        return value

    def validate_product_file(self, value):
        if value and value.size > settings.MAX_FILE_UPLOAD_SIZE:
            limit_mb = settings.MAX_FILE_UPLOAD_SIZE // (1024 * 1024)
            raise serializers.ValidationError(f"File must be {limit_mb} MB or smaller.")
        return value


class OptionSerializer(serializers.Serializer):
    """One dropdown / radio-button option."""

    label = serializers.CharField()
    value = serializers.CharField()


class CategoriesResponseSerializer(serializers.Serializer):
    """Shape of GET /api/categories/ (used for Swagger docs)."""

    categories = OptionSerializer(many=True)


class OptionsResponseSerializer(serializers.Serializer):
    """Shape of GET /api/options/ (used for Swagger docs)."""

    categories = OptionSerializer(many=True)
    conditions = OptionSerializer(many=True)
