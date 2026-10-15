from rest_framework import status, serializers

from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from rest_framework.response import Response

from .models import Lead
from .serializers import LeadSerializer

from services.notification_service import NotificationService

from rest_framework.views import APIView

from rest_framework.parsers import (MultiPartParser, FormParser,)

from .serializers import (LeadSerializer,LeadImportSerializer,)

from services.lead_import_service import (import_leads_from_csv,)

from rest_framework.permissions import IsAuthenticated

# -------------------- Lead List/Create -------------------- #

class LeadListCreateView(ListCreateAPIView):

    serializer_class = LeadSerializer

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Lead.objects.select_related(
                "company",
                "created_by",
            )
            .prefetch_related(
                "contact_owner",
                "products",
            )
        )

        # Admin can see all leads
        if user.role == "Admin":
            return queryset

        # Normal user can see only leads assigned to them
        return queryset.filter(
            contact_owner=user
        ).distinct()

    filterset_fields = (
        "lead_status",
        "company",
        "contact_owner",
        "created_by",
        "lead_date",
        "created_at",
        "is_active",
    )

    search_fields = (
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "job_title",
        "company__company_name",
        "products__name",
    )

    ordering_fields = (
        "first_name",
        "last_name",
        "lead_date",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    def perform_create(self, serializer):

        lead = serializer.save(
            created_by=self.request.user,
        )

        # Assign the created lead to the logged-in user
        lead.contact_owner.add(
            self.request.user
        )

        # ---------------------------------------------
        # CREATE NOTIFICATION
        # ---------------------------------------------

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"created a new lead: "
                f"{lead.first_name} {lead.last_name}"
            ),
        )


# -------------------- Lead Detail -------------------- #

class LeadDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = LeadSerializer

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Lead.objects.select_related(
                "company",
                "created_by",
            )
            .prefetch_related(
                "contact_owner",
                "products",
            )
        )

        # Admin can access every lead
        if user.role == "Admin":
            return queryset

        # Normal user can access only their assigned leads
        return queryset.filter(
            contact_owner=user
        ).distinct()

    def perform_update(self, serializer):

        lead = serializer.save()

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"updated lead: "
                f"{lead.first_name} {lead.last_name}"
            ),
        )

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()

        self.perform_destroy(instance)

        return Response(
            {
                "message": "Lead deleted successfully."
            },
            status=status.HTTP_200_OK,
        )

# =====================================================
# LEAD IMPORT
# =====================================================

class LeadImportView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):

        serializer = LeadImportSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        file = serializer.validated_data["file"]

        try:

            leads = import_leads_from_csv(
                uploaded_file=file,
                created_by=request.user,
            )

            return Response(
                {
                    "message": (
                        "Leads imported successfully."
                    ),
                    "imported_count": len(leads),
                },
                status=status.HTTP_201_CREATED,
            )

        except serializers.ValidationError as error:

            return Response(
                error.detail,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as error:

            print(
                "LEAD IMPORT ERROR:",
                repr(error),
            )

            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )    