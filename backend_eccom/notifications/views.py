from drf_spectacular.utils import extend_schema
from rest_framework import viewsets

from .models import Notification
from .serializers import NotificationSerializer


@extend_schema(tags=["Notifications"])
class NotificationViewSet(viewsets.ModelViewSet):
    """
    GET    /api/notifications/        list (newest first)
    POST   /api/notifications/        create
    GET    /api/notifications/{id}/   one notification
    PATCH  /api/notifications/{id}/   update, e.g. {"is_read": true}
    DELETE /api/notifications/{id}/   delete
    """

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
