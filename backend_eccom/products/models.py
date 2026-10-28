from decimal import Decimal

from django.core.validators import FileExtensionValidator, MinValueValidator
from django.db import models

ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"]
ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx"]


class Product(models.Model):
    """A product in the store, with an optional image and an optional document."""

    class Category(models.TextChoices):
        # value stored in the database, label shown to people
        ELECTRONICS = "electronics", "Electronics"
        CLOTHING = "clothing", "Clothing"
        SHOES = "shoes", "Shoes"
        BOOKS = "books", "Books"
        ACCESSORIES = "accessories", "Accessories"
        HOME = "home", "Home"

    class Condition(models.TextChoices):
        NEW = "new", "New"
        USED = "used", "Used"
        REFURBISHED = "refurbished", "Refurbished"

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.NEW,
    )
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(ALLOWED_IMAGE_EXTENSIONS)],
    )
    product_file = models.FileField(
        upload_to="product_files/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(ALLOWED_FILE_EXTENSIONS)],
        help_text="Manual, warranty or specification document (PDF, DOC, DOCX).",
    )
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
