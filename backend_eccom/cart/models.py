from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from products.models import Product


def stock_error_message(stock):
    """Message used everywhere a requested quantity is larger than the stock."""
    if stock == 0:
        return "This product is out of stock."
    if stock == 1:
        return "Only 1 item is available."
    return f"Only {stock} items are available."


class CartItem(models.Model):
    """
    One product in the demo cart.

    There is no authentication, so there is a single global cart shared by
    every client. Each product can appear only once; adding it again
    increases the quantity instead of creating another row.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(fields=["product"], name="unique_cart_product"),
        ]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def clean(self):
        # Runs in the Django admin, so admin edits respect stock as well.
        if self.product_id and self.quantity and self.quantity > self.product.stock:
            raise ValidationError({"quantity": stock_error_message(self.product.stock)})
