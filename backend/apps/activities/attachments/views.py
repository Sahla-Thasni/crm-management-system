from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket

from .models import Attachment, Module
from .serializers import AttachmentSerializer


# -------------------- Common QuerySet -------------------- #

ATTACHMENT_QUERYSET = (
    Attachment.objects.select_related(
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )
)


# -------------------- Base List/Create -------------------- #

class BaseAttachmentListCreateView(
    ListCreateAPIView,
):

    serializer_class = AttachmentSerializer

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    filterset_fields = (
        "module",
        "created_by",
        "is_active",
    )

    search_fields = (
        "file_name",
        "file",
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
        "file_name",
        "file_size",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )


# -------------------- Lead Attachments -------------------- #

class LeadAttachmentListCreateView(
    BaseAttachmentListCreateView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )

    def perform_create(self, serializer):

        lead = get_object_or_404(
            Lead,
            pk=self.kwargs["lead_id"],
        )

        serializer.save(
            created_by=self.request.user,
            lead=lead,
            module=Module.LEAD,
        )


# -------------------- Company Attachments -------------------- #

class CompanyAttachmentListCreateView(
    BaseAttachmentListCreateView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )

    def perform_create(self, serializer):

        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        serializer.save(
            created_by=self.request.user,
            company=company,
            module=Module.COMPANY,
        )


# -------------------- Deal Attachments -------------------- #

class DealAttachmentListCreateView(
    BaseAttachmentListCreateView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )

    def perform_create(self, serializer):

        deal = get_object_or_404(
            Deal,
            pk=self.kwargs["deal_id"],
        )

        serializer.save(
            created_by=self.request.user,
            deal=deal,
            module=Module.DEAL,
        )


# -------------------- Ticket Attachments -------------------- #

class TicketAttachmentListCreateView(
    BaseAttachmentListCreateView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )

    def perform_create(self, serializer):

        ticket = get_object_or_404(
            Ticket,
            pk=self.kwargs["ticket_id"],
        )

        serializer.save(
            created_by=self.request.user,
            ticket=ticket,
            module=Module.TICKET,
        )


# -------------------- Base Detail -------------------- #

class BaseAttachmentDetailView(
    RetrieveUpdateDestroyAPIView,
):

    serializer_class = AttachmentSerializer

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    def get_queryset(self):

        return ATTACHMENT_QUERYSET


# -------------------- Lead Attachment Detail -------------------- #

class LeadAttachmentDetailView(
    BaseAttachmentDetailView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )


# -------------------- Company Attachment Detail -------------------- #

class CompanyAttachmentDetailView(
    BaseAttachmentDetailView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )


# -------------------- Deal Attachment Detail -------------------- #

class DealAttachmentDetailView(
    BaseAttachmentDetailView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )


# -------------------- Ticket Attachment Detail -------------------- #

class TicketAttachmentDetailView(
    BaseAttachmentDetailView,
):

    def get_queryset(self):

        return ATTACHMENT_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )