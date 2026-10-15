from rest_framework import status
from django.db import transaction
from django.db.models.deletion import ProtectedError

from rest_framework.generics import (ListCreateAPIView, RetrieveUpdateDestroyAPIView,)

from rest_framework.response import Response

from apps.leads.models import LeadStatus

from services.notification_service import NotificationService

from .models import Deal
from .serializers import DealSerializer

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated

from services.deal_import_service import ( import_deals_from_csv,)

# -------------------- Deal List/Create View -------------------- #

class DealListCreateView(ListCreateAPIView):

    serializer_class = DealSerializer

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Deal.objects.select_related(
                "associated_lead",
                "created_by",
            )
            .prefetch_related(
                "deal_owner",
            )
        )

        # Admin can see all deals
        if user.role == "Admin":
            return queryset

        # Normal user can see only deals assigned to them
        return queryset.filter(
            deal_owner=user
        ).distinct()

    filterset_fields = (
        "deal_stage",
        "priority",
        "associated_lead",
        "deal_owner",
        "created_by",
        "close_date",
        "is_active",
    )

    search_fields = (
        "deal_name",
        "associated_lead__first_name",
        "associated_lead__last_name",
        "associated_lead__phone_number",
        "associated_lead__city",
    )

    ordering_fields = (
        "deal_name",
        "amount",
        "close_date",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    def perform_create(self, serializer):

        with transaction.atomic():

            # -------------------------------------------------
            # CREATE DEAL
            # -------------------------------------------------

            deal = serializer.save(
                created_by=self.request.user,
            )

            # -------------------------------------------------
            # CONVERT ASSOCIATED LEAD
            # -------------------------------------------------

            lead = deal.associated_lead

            lead.lead_status = LeadStatus.CONVERTED

            lead.save(
                update_fields=[
                    "lead_status",
                ]
            )

            # -------------------------------------------------
            # CREATE NOTIFICATION
            # -------------------------------------------------

            NotificationService.create(
                user=self.request.user,
                message=(
                    f"{self.request.user.get_full_name()} "
                    f"created a new deal: "
                    f"{deal.deal_name}"
                ),
            )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This deal cannot be deleted because tickets are linked to it. "
                        "Delete or reassign the tickets first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Deal deleted successfully."
            },
            status=status.HTTP_200_OK,
        )

# -------------------- Deal Detail View -------------------- #

class DealDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = DealSerializer

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Deal.objects.select_related(
                "associated_lead",
                "created_by",
            )
            .prefetch_related(
                "deal_owner",
            )
        )

        # Admin can access every deal
        if user.role == "Admin":
            return queryset

        # Normal user can access only their assigned deals
        return queryset.filter(
            deal_owner=user
        ).distinct()
    
    def perform_update(self, serializer):

        deal = serializer.save()

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"updated deal: "
                f"{deal.deal_name}"
            ),
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This deal cannot be deleted because tickets are linked to it. "
                        "Delete or reassign the tickets first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Deal deleted successfully."
            },
            status=status.HTTP_200_OK,
        )
# =====================================================
# DEAL IMPORT
# =====================================================

class DealImportView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {
                    "detail": "CSV file is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            deals = import_deals_from_csv(
                uploaded_file=file,
                created_by=request.user,
            )

            return Response(
                {
                    "message": (
                        "Deals imported successfully."
                    ),
                    "imported_count": len(deals),
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
                "DEAL IMPORT ERROR:",
                repr(error),
            )

            return Response(
                {
                    "detail": str(error)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )    