from django.contrib import admin
from django.utils.html import format_html

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "thumbnail",
        "name",
        "category",
        "condition",
        "price",
        "stock",
        "created_at",
    ]
    list_display_links = ["id", "name"]
    list_filter = ["category", "condition"]
    search_fields = ["name", "description"]
    readonly_fields = ["image_preview", "created_at", "updated_at"]
    fieldsets = [
        (None, {"fields": ["name", "description", "price", "stock"]}),
        ("Options", {"fields": ["category", "condition"]}),
        ("Uploads", {"fields": ["image", "image_preview", "product_file"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    @admin.display(description="Image")
    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;border-radius:4px;">', obj.image.url)
        return "-"

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:200px;">', obj.image.url)
        return "No image uploaded."
