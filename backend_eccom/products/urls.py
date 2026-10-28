from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import CategoryListView, OptionsView, ProductViewSet

# SimpleRouter creates:
#   products/        -> list, create
#   products/{id}/   -> retrieve, update, partial_update, destroy
router = SimpleRouter()
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="categories"),
    path("options/", OptionsView.as_view(), name="options"),
]

urlpatterns += router.urls
