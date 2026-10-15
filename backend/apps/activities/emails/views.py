from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket

from .models import Email, EmailAttachment, Module
from .serializers import EmailSerializer
from .services import send_email


# -------------------- Common QuerySet -------------------- #

EMAIL_QUERYSET = (
    Email.objects.select_related(
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )
    .prefetch_related(
        "attachments",
    )
    .filter(
        is_active=True,
    )
)


# -------------------- Base List/Create -------------------- #

class BaseEmailListCreateView(ListCreateAPIView):

    serializer_class = EmailSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    filterset_fields = (
        "status",
        "created_by",
        "sent_at",
        "is_active",
    )

    search_fields = (
        "subject",
        "body",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
        "lead__first_name",
        "lead__last_name",
        "company__company_name",
        "deal__deal_name",
        "ticket__ticket_name",
    )

    ordering_fields = (
        "subject",
        "status",
        "sent_at",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    # -------------------- Save Attachments -------------------- #

    def save_attachments(self, email):

        uploaded_files = self.request.FILES.getlist(
            "attachments",
        )

        for uploaded_file in uploaded_files:

            EmailAttachment.objects.create(
                email=email,
                file=uploaded_file,
                file_name=uploaded_file.name,
                file_size=uploaded_file.size,
            )


# -------------------- Lead Emails -------------------- #

class LeadEmailListCreateView(BaseEmailListCreateView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )

    def perform_create(self, serializer):

        lead = get_object_or_404(
            Lead,
            pk=self.kwargs["lead_id"],
        )

        email = serializer.save(
            created_by=self.request.user,
            lead=lead,
            module=Module.LEAD,
            is_active=True,
        )

        self.save_attachments(email)

        send_email(email)


# -------------------- Company Emails -------------------- #

class CompanyEmailListCreateView(BaseEmailListCreateView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )

    def perform_create(self, serializer):

        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        email = serializer.save(
            created_by=self.request.user,
            company=company,
            module=Module.COMPANY,
            is_active=True,
        )

        self.save_attachments(email)

        send_email(email)


# -------------------- Deal Emails -------------------- #

class DealEmailListCreateView(BaseEmailListCreateView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )

    def perform_create(self, serializer):

        deal = get_object_or_404(
            Deal,
            pk=self.kwargs["deal_id"],
        )

        email = serializer.save(
            created_by=self.request.user,
            deal=deal,
            module=Module.DEAL,
            is_active=True,
        )

        self.save_attachments(email)

        send_email(email)


# -------------------- Ticket Emails -------------------- #

class TicketEmailListCreateView(BaseEmailListCreateView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )

    def perform_create(self, serializer):

        ticket = get_object_or_404(
            Ticket,
            pk=self.kwargs["ticket_id"],
        )

        email = serializer.save(
            created_by=self.request.user,
            ticket=ticket,
            module=Module.TICKET,
            is_active=True,
        )

        self.save_attachments(email)

        send_email(email)


# -------------------- Base Detail -------------------- #

class BaseEmailDetailView(
    RetrieveUpdateDestroyAPIView,
):

    serializer_class = EmailSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    def get_queryset(self):

        return EMAIL_QUERYSET

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):

        instance = self.get_object()

        # Soft delete
        instance.is_active = False

        instance.save(
            update_fields=(
                "is_active",
                "updated_at",
            ),
        )

        return Response(
            {
                "message": "Email deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Lead Email Detail -------------------- #

class LeadEmailDetailView(BaseEmailDetailView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )


# -------------------- Company Email Detail -------------------- #

class CompanyEmailDetailView(BaseEmailDetailView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )


# -------------------- Deal Email Detail -------------------- #

class DealEmailDetailView(BaseEmailDetailView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )


# -------------------- Ticket Email Detail -------------------- #

class TicketEmailDetailView(BaseEmailDetailView):

    def get_queryset(self):

        return EMAIL_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )