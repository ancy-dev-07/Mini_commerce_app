from rest_framework import serializers

from products.models import Product

from .models import CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """
    Input  (POST):  {"product": 1, "quantity": 1}
    Input  (PATCH): {"quantity": 3}
    Output: cart item with product name, image URL, price and subtotal.
    """

    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, default=1)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.SerializerMethodField()
    price = serializers.DecimalField(
        source="product.price", max_digits=10, decimal_places=2, read_only=True
    )
    stock = serializers.IntegerField(source="product.stock", read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "price",
            "stock",
            "quantity",
            "subtotal",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        # The "one row per product" rule is handled in the view (merge quantities),
        # so turn off DRF's automatic unique validator for the product field.
        validators = []

    def get_product_image(self, obj) -> str | None:
        if not obj.product.image:
            return None
        request = self.context.get("request")
        url = obj.product.image.url
        return request.build_absolute_uri(url) if request else url

    def validate_product(self, value):
        # Changing the product of an existing cart row is not allowed;
        # remove the item and add the other product instead.
        if self.instance is not None and value != self.instance.product:
            raise serializers.ValidationError(
                "The product of a cart item cannot be changed. Remove it and add the other product."
            )
        return value


class CartResponseSerializer(serializers.Serializer):
    """Shape of GET /api/cart/ (used for Swagger docs)."""

    items = CartItemSerializer(many=True)
    count = serializers.IntegerField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
