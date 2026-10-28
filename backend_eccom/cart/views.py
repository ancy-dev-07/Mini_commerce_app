from decimal import Decimal

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from notifications.models import Notification

from .models import CartItem, stock_error_message
from .serializers import CartItemSerializer, CartResponseSerializer


def check_stock(product, quantity):
    """Raise a 400 error like {"detail": "Only 3 items are available."}."""
    if quantity > product.stock:
        raise ValidationError({"detail": stock_error_message(product.stock)})


@extend_schema(tags=["Cart"])
class CartItemViewSet(viewsets.ModelViewSet):
    """
    Demo cart (global, no users).

    GET    /api/cart/        all items + total
    POST   /api/cart/        add a product (merges with an existing row)
    GET    /api/cart/{id}/   one item
    PATCH  /api/cart/{id}/   change quantity
    DELETE /api/cart/{id}/   remove item
    """

    queryset = CartItem.objects.select_related("product")
    serializer_class = CartItemSerializer
    # PUT is not needed: PATCH is used to change the quantity.
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    @extend_schema(responses=CartResponseSerializer)
    def list(self, request, *args, **kwargs):
        items = list(self.get_queryset())
        serializer = self.get_serializer(items, many=True)
        total = sum((item.subtotal for item in items), Decimal("0.00"))
        return Response(
            {
                "items": serializer.data,
                "count": len(items),
                "total": f"{total:.2f}",
            }
        )

    @extend_schema(
        responses={
            201: CartItemSerializer,
            200: CartItemSerializer,
        },
        description=(
            "Adds a product to the cart. If the product is already in the cart, "
            "its quantity is increased (200) instead of creating a new row (201)."
        ),
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        existing_item = CartItem.objects.filter(product=product).first()
        new_quantity = quantity + (existing_item.quantity if existing_item else 0)
        check_stock(product, new_quantity)

        if existing_item:
            existing_item.quantity = new_quantity
            existing_item.save(update_fields=["quantity", "updated_at"])
            cart_item = existing_item
            response_status = status.HTTP_200_OK
        else:
            cart_item = CartItem.objects.create(product=product, quantity=quantity)
            response_status = status.HTTP_201_CREATED

        Notification.objects.create(
            title="Cart Updated",
            message=f'"{product.name}" was added to your cart (quantity: {cart_item.quantity}).',
        )

        return Response(self.get_serializer(cart_item).data, status=response_status)

    def perform_update(self, serializer):
        cart_item = serializer.instance
        new_quantity = serializer.validated_data.get("quantity", cart_item.quantity)
        check_stock(cart_item.product, new_quantity)
        serializer.save()
