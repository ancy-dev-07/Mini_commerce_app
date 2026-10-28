from rest_framework.routers import SimpleRouter

from .views import CartItemViewSet

# SimpleRouter creates:
#   cart/        -> list, create
#   cart/{id}/   -> retrieve, partial_update, destroy
router = SimpleRouter()
router.register("cart", CartItemViewSet, basename="cart")

urlpatterns = router.urls
