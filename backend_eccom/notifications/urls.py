from rest_framework.routers import SimpleRouter

from .views import NotificationViewSet

# SimpleRouter creates:
#   notifications/        -> list, create
#   notifications/{id}/   -> retrieve, partial_update, destroy
router = SimpleRouter()
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = router.urls
