from rest_framework import status, serializers

from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from services.ticket_import_service import (
    import_tickets_from_csv,
)

from .models import Ticket
from .serializers import TicketSerializer

from services.notification_service import NotificationService


# -------------------- Common QuerySet -------------------- #

TICKET_QUERYSET = (
    Ticket.objects.select_related(
        "associated_deal",
        "associated_deal__associated_lead",
        "created_by",
    ).prefetch_related(
        "ticket_owner",
    )
)


# -------------------- Ticket List/Create -------------------- #

class TicketListCreateView(ListCreateAPIView):

    serializer_class = TicketSerializer

    def get_queryset(self):

        user = self.request.user

        queryset = TICKET_QUERYSET

        # Admin can see all tickets
        if user.role == "Admin":
            return queryset

        # Normal user can see only tickets assigned to them
        return queryset.filter(
            ticket_owner=user
        ).distinct()

    filterset_fields = (
        "ticket_status",
        "priority",
        "source",
        "associated_deal",
        "ticket_owner",
        "created_by",
        "is_active",
    )

    search_fields = (
        "ticket_name",
        "associated_deal__deal_name",
        "associated_deal__associated_lead__first_name",
        "associated_deal__associated_lead__last_name",
        "associated_deal__associated_lead__phone_number",
        "associated_deal__associated_lead__city",
    )

    ordering_fields = (
        "ticket_name",
        "ticket_status",
        "priority",
        "source",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    def perform_create(self, serializer):

        ticket = serializer.save(
            created_by=self.request.user,
        )

        # ---------------------------------------------
        # CREATE NOTIFICATION
        # ---------------------------------------------

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"created a new ticket: "
                f"{ticket.ticket_name}"
            ),
        )


# -------------------- Ticket Detail -------------------- #

class TicketDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = TicketSerializer
    
    def get_queryset(self):

        user = self.request.user

        queryset = TICKET_QUERYSET

        # Admin can access every ticket
        if user.role == "Admin":
            return queryset

        # Normal user can access only their assigned tickets
        return queryset.filter(
            ticket_owner=user
        ).distinct()
    
    def perform_update(self, serializer):

        ticket = serializer.save()

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"updated ticket: "
                f"{ticket.ticket_name}"
            ),
        )

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()

        self.perform_destroy(instance)

        return Response(
            {
                "message": "Ticket deleted successfully."
            },
            status=status.HTTP_200_OK,
        )
# =====================================================
# Ticket CSV Import
# =====================================================

class TicketImportView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    def post(self, request):

        uploaded_file = request.FILES.get(
            "file"
        )

        # ---------------------------------------------
        # FILE REQUIRED
        # ---------------------------------------------

        if not uploaded_file:
            return Response(
                {
                    "message": "Please upload a CSV file."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # CSV VALIDATION
        # ---------------------------------------------

        if not uploaded_file.name.lower().endswith(
            ".csv"
        ):
            return Response(
                {
                    "message": (
                        "Only CSV files are supported."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # FILE SIZE
        # ---------------------------------------------

        max_file_size = 5 * 1024 * 1024

        if uploaded_file.size > max_file_size:
            return Response(
                {
                    "message": (
                        "CSV file size cannot exceed 5 MB."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # IMPORT
        # ---------------------------------------------

        try:

            imported_count = (
                import_tickets_from_csv(
                    uploaded_file=uploaded_file,
                    created_by=request.user,
                )
            )

            return Response(
                {
                    "message": (
                        "Tickets imported successfully."
                    ),
                    "imported_count": imported_count,
                },
                status=status.HTTP_201_CREATED,
            )

        except serializers.ValidationError as error:

            return Response(
                error.detail,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as error:

            return Response(
                {
                    "message": (
                        "Failed to import tickets."
                    ),
                    "error": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )    