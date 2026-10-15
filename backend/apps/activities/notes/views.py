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

from .models import Module, Note
from .serializers import NoteSerializer


# -------------------- Common QuerySet -------------------- #

NOTE_QUERYSET = (
    Note.objects.select_related(
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )
)


# -------------------- Base List/Create -------------------- #

class BaseNoteListCreateView(ListCreateAPIView):

    serializer_class = NoteSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    search_fields = (
        "note",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
    )

    ordering_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )


# -------------------- Lead Notes -------------------- #

class LeadNoteListCreateView(BaseNoteListCreateView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
            is_active=True,
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


# -------------------- Company Notes -------------------- #

class CompanyNoteListCreateView(BaseNoteListCreateView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
            is_active=True,
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


# -------------------- Deal Notes -------------------- #

class DealNoteListCreateView(BaseNoteListCreateView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
            is_active=True,
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


# -------------------- Ticket Notes -------------------- #

class TicketNoteListCreateView(BaseNoteListCreateView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
            is_active=True,
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

class BaseNoteDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = NoteSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return Response(
            {
                "message": "Note deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Lead Note Detail -------------------- #

class LeadNoteDetailView(BaseNoteDetailView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
            is_active=True,
        )


# -------------------- Company Note Detail -------------------- #

class CompanyNoteDetailView(BaseNoteDetailView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
            is_active=True,
        )


# -------------------- Deal Note Detail -------------------- #

class DealNoteDetailView(BaseNoteDetailView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
            is_active=True,
        )


# -------------------- Ticket Note Detail -------------------- #

class TicketNoteDetailView(BaseNoteDetailView):

    def get_queryset(self):
        return NOTE_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
            is_active=True,
        )