from django.contrib import admin

from .models import CartItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "quantity", "unit_price", "subtotal", "updated_at"]
    list_editable = ["quantity"]
    list_select_related = ["product"]
    search_fields = ["product__name"]
    readonly_fields = ["created_at", "updated_at"]

    @admin.display(description="Price")
    def unit_price(self, obj):
        return obj.product.price

    @admin.display(description="Subtotal")
    def subtotal(self, obj):
        return obj.subtotal
