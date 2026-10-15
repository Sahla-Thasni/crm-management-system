from apps.notifications.models import Notification


class NotificationService:

    @staticmethod
    def create(
        user,
        message,
    ):
        return Notification.objects.create(
            created_for=user,
            message=message,
        )