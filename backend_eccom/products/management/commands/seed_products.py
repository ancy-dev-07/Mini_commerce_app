from decimal import Decimal

from django.core.management.base import BaseCommand

from products.models import Product

SAMPLE_PRODUCTS = [
    {
        "name": "Wireless Headphones",
        "description": "Bluetooth wireless headphones with 30-hour battery life.",
        "price": Decimal("2999.00"),
        "category": Product.Category.ELECTRONICS,
        "condition": Product.Condition.NEW,
        "stock": 10,
    },
    {
        "name": "Running Shoes",
        "description": "Lightweight running shoes with breathable mesh.",
        "price": Decimal("2499.00"),
        "category": Product.Category.SHOES,
        "condition": Product.Condition.NEW,
        "stock": 15,
    },
    {
        "name": "Backpack",
        "description": "25L everyday backpack with a laptop sleeve.",
        "price": Decimal("1499.00"),
        "category": Product.Category.ACCESSORIES,
        "condition": Product.Condition.NEW,
        "stock": 20,
    },
    {
        "name": "Cotton T-Shirt",
        "description": "Plain crew-neck cotton t-shirt.",
        "price": Decimal("499.00"),
        "category": Product.Category.CLOTHING,
        "condition": Product.Condition.NEW,
        "stock": 30,
    },
    {
        "name": "Python Programming Book",
        "description": "Beginner-friendly Python book, lightly used.",
        "price": Decimal("350.00"),
        "category": Product.Category.BOOKS,
        "condition": Product.Condition.USED,
        "stock": 3,
    },
    {
        "name": "Table Lamp",
        "description": "LED desk lamp with adjustable brightness.",
        "price": Decimal("899.00"),
        "category": Product.Category.HOME,
        "condition": Product.Condition.REFURBISHED,
        "stock": 5,
    },
]


class Command(BaseCommand):
    help = "Create sample products for testing (safe to run more than once)."

    def handle(self, *args, **options):
        created_count = 0
        for data in SAMPLE_PRODUCTS:
            _, created = Product.objects.get_or_create(name=data["name"], defaults=data)
            if created:
                created_count += 1
                self.stdout.write(f"  created: {data['name']}")
            else:
                self.stdout.write(f"  exists:  {data['name']}")

        self.stdout.write(self.style.SUCCESS(f"Done. {created_count} new product(s) created."))
