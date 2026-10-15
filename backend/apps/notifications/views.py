from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    
    permission_classes = [
        IsAuthenticated,
    ]
    
    def get(self, request):

        notifications = Notification.objects.filter(
            created_for=request.user,
        )

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class NotificationDetailView(APIView):
    
    permission_classes = [
        IsAuthenticated,
    ]

    def patch(self, request, pk):

        notification = get_object_or_404(
            Notification,
            pk=pk,
            created_for=request.user,
        )

        notification.is_read = True

        notification.save(
            update_fields=(
                "is_read",
            )
        )

        serializer = NotificationSerializer(
            notification,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )