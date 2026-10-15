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

from .models import Meeting, Module
from .serializers import MeetingSerializer


# -------------------- Common QuerySet -------------------- #

MEETING_QUERYSET = (
    Meeting.objects.select_related(
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )
    .prefetch_related(
        "attendees",
    )
    .filter(
        is_active=True,
    )
)


# -------------------- Base List/Create -------------------- #

class BaseMeetingListCreateView(ListCreateAPIView):

    serializer_class = MeetingSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    filterset_fields = (
        "start_date",
        "reminder",
        "created_by",
        "is_active",
    )

    search_fields = (
        "title",
        "note",
        "location",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
    )

    ordering_fields = (
        "start_date",
        "start_time",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    def save_attendees(
        self,
        meeting,
    ):
        """
        Save attendees selected from the frontend.

        Expected request data:

            {
                "attendees": [2, 3, 5]
            }

        If attendees are not supplied, keep the meeting
        with no attendees.
        """

        attendee_ids = self.request.data.get(
            "attendees",
            [],
        )

        if attendee_ids is None:
            attendee_ids = []

        # Make sure we always work with a list.
        if not isinstance(
            attendee_ids,
            list,
        ):
            attendee_ids = [
                attendee_ids,
            ]

        # Remove empty values and duplicate IDs.
        attendee_ids = list(
            dict.fromkeys(
                str(attendee_id)
                for attendee_id in attendee_ids
                if str(attendee_id).strip()
            )
        )

        meeting.attendees.set(
            attendee_ids,
        )


# -------------------- Lead Meetings -------------------- #

class LeadMeetingListCreateView(
    BaseMeetingListCreateView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )

    def perform_create(
        self,
        serializer,
    ):

        lead = get_object_or_404(
            Lead,
            pk=self.kwargs["lead_id"],
        )

        meeting = serializer.save(
            created_by=self.request.user,
            lead=lead,
            module=Module.LEAD,
        )

        self.save_attendees(
            meeting,
        )


# -------------------- Company Meetings -------------------- #

class CompanyMeetingListCreateView(
    BaseMeetingListCreateView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )

    def perform_create(
        self,
        serializer,
    ):

        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        meeting = serializer.save(
            created_by=self.request.user,
            company=company,
            module=Module.COMPANY,
        )

        self.save_attendees(
            meeting,
        )


# -------------------- Deal Meetings -------------------- #

class DealMeetingListCreateView(
    BaseMeetingListCreateView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )

    def perform_create(
        self,
        serializer,
    ):

        deal = get_object_or_404(
            Deal,
            pk=self.kwargs["deal_id"],
        )

        meeting = serializer.save(
            created_by=self.request.user,
            deal=deal,
            module=Module.DEAL,
        )

        self.save_attendees(
            meeting,
        )


# -------------------- Ticket Meetings -------------------- #

class TicketMeetingListCreateView(
    BaseMeetingListCreateView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )

    def perform_create(
        self,
        serializer,
    ):

        ticket = get_object_or_404(
            Ticket,
            pk=self.kwargs["ticket_id"],
        )

        meeting = serializer.save(
            created_by=self.request.user,
            ticket=ticket,
            module=Module.TICKET,
        )

        self.save_attendees(
            meeting,
        )


# -------------------- Base Detail -------------------- #

class BaseMeetingDetailView(
    RetrieveUpdateDestroyAPIView,
):

    serializer_class = MeetingSerializer

    permission_classes = (
        DjangoModelPermissions,
    )

    def get_queryset(self):

        return MEETING_QUERYSET

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):

        instance = self.get_object()

        instance.is_active = False

        instance.save(
            update_fields=(
                "is_active",
                "updated_at",
            ),
        )

        return Response(
            {
                "message": "Meeting deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Lead Meeting Detail -------------------- #

class LeadMeetingDetailView(
    BaseMeetingDetailView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )


# -------------------- Company Meeting Detail -------------------- #

class CompanyMeetingDetailView(
    BaseMeetingDetailView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )


# -------------------- Deal Meeting Detail -------------------- #

class DealMeetingDetailView(
    BaseMeetingDetailView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )


# -------------------- Ticket Meeting Detail -------------------- #

class TicketMeetingDetailView(
    BaseMeetingDetailView,
):

    def get_queryset(self):

        return MEETING_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )