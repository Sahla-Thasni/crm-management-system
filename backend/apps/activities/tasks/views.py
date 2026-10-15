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

from .models import Module, Task
from .serializers import TaskSerializer


# -------------------- Common QuerySet -------------------- #

TASK_QUERYSET = (
    Task.objects
    .select_related(
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )
    .prefetch_related(
        "assigned_to",
    )
    .filter(
        is_active=True,
    )
)
# -------------------- Base List/Create -------------------- #

class BaseTaskListCreateView(ListCreateAPIView):

    serializer_class = TaskSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    filterset_fields = (
        "task_type",
        "priority",
        "assigned_to",
        "due_date",
        "created_by",
        "is_active",
    )

    search_fields = (
        "title",
        "note",
        "assigned_to__first_name",
        "assigned_to__last_name",
        "assigned_to__email",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
    )

    ordering_fields = (
        "due_date",
        "due_time",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )


# -------------------- Lead Tasks -------------------- #

class LeadTaskListCreateView(BaseTaskListCreateView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
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


# -------------------- Company Tasks -------------------- #

class CompanyTaskListCreateView(BaseTaskListCreateView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
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


# -------------------- Deal Tasks -------------------- #

class DealTaskListCreateView(BaseTaskListCreateView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
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


# -------------------- Ticket Tasks -------------------- #

class TicketTaskListCreateView(BaseTaskListCreateView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
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

class BaseTaskDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = TaskSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        instance.is_active = False
        instance.save(
            update_fields=(
                "is_active",
            )
        )

        return Response(
            {
                "message": "Task deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Lead Task Detail -------------------- #

class LeadTaskDetailView(BaseTaskDetailView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )


# -------------------- Company Task Detail -------------------- #

class CompanyTaskDetailView(BaseTaskDetailView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )


# -------------------- Deal Task Detail -------------------- #

class DealTaskDetailView(BaseTaskDetailView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )


# -------------------- Ticket Task Detail -------------------- #

class TicketTaskDetailView(BaseTaskDetailView):

    def get_queryset(self):
        return TASK_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )
