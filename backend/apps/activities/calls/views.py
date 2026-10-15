from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse

from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import (
    DjangoModelPermissions,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket

from .models import Call, Module
from .serializers import CallSerializer

from services.phone_call_service import PhoneCallService
from twilio.base.exceptions import TwilioRestException


CALL_QUERYSET = (
    Call.objects.select_related(
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )
)


# ============================================================
# BASE CALL LIST / CREATE VIEW
# ============================================================

class BaseCallListCreateView(ListCreateAPIView):

    serializer_class = CallSerializer
    permission_classes = (DjangoModelPermissions,)

    filterset_fields = (
        "call_outcome",
        "call_date",
        "created_by",
        "is_active",
    )

    search_fields = (
        "note",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
    )

    ordering_fields = (
        "call_date",
        "call_time",
        "duration",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)


# ============================================================
# LEAD CALL LIST / CREATE
# ============================================================

class LeadCallListCreateView(BaseCallListCreateView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
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
            phone_number=lead.phone_number,
        )


# ============================================================
# COMPANY CALL LIST / CREATE
# ============================================================

class CompanyCallListCreateView(BaseCallListCreateView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
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
            phone_number=company.phone_number,
        )


# ============================================================
# DEAL CALL LIST / CREATE
# ============================================================

class DealCallListCreateView(BaseCallListCreateView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
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
            phone_number=deal.associated_lead.phone_number,
        )


# ============================================================
# TICKET CALL LIST / CREATE
# ============================================================

class TicketCallListCreateView(BaseCallListCreateView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
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
            phone_number=(
                ticket.associated_deal
                .associated_lead
                .phone_number
            ),
        )


# ============================================================
# BASE CALL DETAIL VIEW
# ============================================================

class BaseCallDetailView(
    RetrieveUpdateDestroyAPIView
):

    serializer_class = CallSerializer
    permission_classes = (DjangoModelPermissions,)

    def get_queryset(self):

        return CALL_QUERYSET

    def destroy(self, request, *args, **kwargs):

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
                "message": "Call deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# LEAD CALL DETAIL
# ============================================================

class LeadCallDetailView(BaseCallDetailView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
            lead_id=self.kwargs["lead_id"],
            module=Module.LEAD,
        )


# ============================================================
# COMPANY CALL DETAIL
# ============================================================

class CompanyCallDetailView(BaseCallDetailView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
            company_id=self.kwargs["company_id"],
            module=Module.COMPANY,
        )


# ============================================================
# DEAL CALL DETAIL
# ============================================================

class DealCallDetailView(BaseCallDetailView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
            deal_id=self.kwargs["deal_id"],
            module=Module.DEAL,
        )


# ============================================================
# TICKET CALL DETAIL
# ============================================================

class TicketCallDetailView(BaseCallDetailView):

    def get_queryset(self):

        return CALL_QUERYSET.filter(
            ticket_id=self.kwargs["ticket_id"],
            module=Module.TICKET,
        )


# ============================================================
# START PHONE CALL
# ============================================================

class StartPhoneCallView(APIView):

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):

        call_id = kwargs.get("call_id")

        # ----------------------------------------------------
        # Get Call
        # ----------------------------------------------------

        call = get_object_or_404(
            Call,
            pk=call_id,
            is_active=True,
        )

        # ----------------------------------------------------
        # Validate Parent Object
        # ----------------------------------------------------

        if "lead_id" in kwargs:

            if (
                call.module != Module.LEAD
                or call.lead_id != kwargs["lead_id"]
            ):

                return Response(
                    {
                        "detail": (
                            "This call does not belong "
                            "to the specified lead."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        elif "company_id" in kwargs:

            if (
                call.module != Module.COMPANY
                or call.company_id != kwargs["company_id"]
            ):

                return Response(
                    {
                        "detail": (
                            "This call does not belong "
                            "to the specified company."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        elif "deal_id" in kwargs:

            if (
                call.module != Module.DEAL
                or call.deal_id != kwargs["deal_id"]
            ):

                return Response(
                    {
                        "detail": (
                            "This call does not belong "
                            "to the specified deal."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        elif "ticket_id" in kwargs:

            if (
                call.module != Module.TICKET
                or call.ticket_id != kwargs["ticket_id"]
            ):

                return Response(
                    {
                        "detail": (
                            "This call does not belong "
                            "to the specified ticket."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        # ----------------------------------------------------
        # Validate Phone Number
        # ----------------------------------------------------

        if not call.phone_number:

            return Response(
                {
                    "detail": (
                        "Phone number is required "
                        "to make a phone call."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Customer Number
        # ----------------------------------------------------

        to_phone = call.phone_number

        # ----------------------------------------------------
        # Validate Call Status
        # ----------------------------------------------------

        if call.phone_call_status in (
            Call.PhoneCallStatus.INITIATED,
            Call.PhoneCallStatus.RINGING,
            Call.PhoneCallStatus.IN_PROGRESS,
        ):

            return Response(
                {
                    "detail": (
                        "This phone call is already "
                        "in progress."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Debug Information
        # ----------------------------------------------------

        print(
            "========== START PHONE CALL =========="
        )

        print("CALL ID:", call.id)
        print(
            "CALL PHONE NUMBER:",
            call.phone_number,
        )
        print("TO PHONE:", to_phone)
        print("CRM USER:", request.user)

        print(
            "======================================"
        )

        # ----------------------------------------------------
        # Initiate Twilio Call
        # ----------------------------------------------------

        try:

            twilio_call = PhoneCallService.initiate(
                call=call,
                to_phone=to_phone,
            )

        except TwilioRestException as error:

            print(
                "TWILIO CALL ERROR:",
                str(error),
            )

            return Response(
                {
                    "detail": str(error),
                    "call_id": call.id,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # SAVE TWILIO CALL INFORMATION IMMEDIATELY
        # ----------------------------------------------------

        call.twilio_call_sid = twilio_call.sid

        call.phone_call_status = (
            Call.PhoneCallStatus.INITIATED
        )

        call.save(
            update_fields=[
                "twilio_call_sid",
                "phone_call_status",
                "updated_at",
            ]
        )

        # ----------------------------------------------------
        # Debug
        # ----------------------------------------------------

        print(
            "========== TWILIO CALL SAVED =========="
        )

        print(
            "TWILIO CALL SID:",
            call.twilio_call_sid,
        )

        print(
            "PHONE CALL STATUS:",
            call.phone_call_status,
        )

        print(
            "======================================="
        )

        # ----------------------------------------------------
        # Return Success Response
        # ----------------------------------------------------

        return Response(
            {
                "message": (
                    "Phone call initiated successfully."
                ),
                "call_id": call.id,
                "phone_number": call.phone_number,
                "twilio_call_sid": twilio_call.sid,
                "phone_call_status": (
                    call.phone_call_status
                ),
            },
            status=status.HTTP_200_OK,
        )



# ============================================================
# TWILIO VOICE VIEW
# ============================================================

class TwilioVoiceView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):

        call_id = request.query_params.get(
            "call_id"
        )

        call = get_object_or_404(
            Call,
            pk=call_id,
            is_active=True,
        )

        response = f"""
        <Response>
            <Say>
                Connecting you to the customer.
            </Say>
            <Dial>
                <Number>{call.phone_number}</Number>
            </Dial>
        </Response>
        """

        return HttpResponse(
            response,
            content_type="text/xml",
        )


# ============================================================
# TWILIO STATUS WEBHOOK
# ============================================================

class TwilioWebhookView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):

        call_id = request.query_params.get(
            "call_id"
        )

        call = get_object_or_404(
            Call,
            pk=call_id,
            is_active=True,
        )

        # ----------------------------------------------------
        # Get Twilio webhook data
        # ----------------------------------------------------

        call_status = request.data.get(
            "CallStatus"
        )

        call_sid = request.data.get(
            "CallSid"
        )

        call_duration = request.data.get(
            "CallDuration"
        )

        # ----------------------------------------------------
        # Debug Twilio webhook
        # ----------------------------------------------------

        print(
            "========== TWILIO WEBHOOK DATA =========="
        )

        print("CALL ID:", call.id)
        print("CALL STATUS:", call_status)
        print("CALL SID:", call_sid)
        print("CALL DURATION:", call_duration)
        print(
            "FULL WEBHOOK DATA:",
            dict(request.data),
        )

        print(
            "========================================="
        )

        # ----------------------------------------------------
        # Map Twilio status to CRM phone status
        # ----------------------------------------------------

        status_map = {

            "initiated":
                Call.PhoneCallStatus.INITIATED,

            "ringing":
                Call.PhoneCallStatus.RINGING,

            "in-progress":
                Call.PhoneCallStatus.IN_PROGRESS,

            "completed":
                Call.PhoneCallStatus.COMPLETED,

            "failed":
                Call.PhoneCallStatus.FAILED,

            "busy":
                Call.PhoneCallStatus.FAILED,

            "no-answer":
                Call.PhoneCallStatus.CANCELED,

            "canceled":
                Call.PhoneCallStatus.CANCELED,
        }

        if call_status in status_map:

            call.phone_call_status = (
                status_map[call_status]
            )

        # ----------------------------------------------------
        # Save Twilio Call SID
        # ----------------------------------------------------

        if call_sid:

            call.twilio_call_sid = call_sid

        # ----------------------------------------------------
        # Call Started
        # ----------------------------------------------------

        if call_status == "initiated":

            call.phone_call_started_at = (
                timezone.now()
            )

        # ----------------------------------------------------
        # Call Ended
        # ----------------------------------------------------

        if call_status in (
            "completed",
            "failed",
            "busy",
            "no-answer",
            "canceled",
        ):

            call.phone_call_ended_at = (
                timezone.now()
            )

        # ----------------------------------------------------
        # Call Duration
        # ----------------------------------------------------

        print(
            "========== SAVING CALL DURATION =========="
        )

        print(
            "RAW CALL DURATION:",
            call_duration,
        )

        if call_duration is not None:

            try:

                duration_seconds = int(
                    call_duration
                )

                # --------------------------------------------
                # Only save a positive duration.
                # --------------------------------------------

                if duration_seconds > 0:

                    call.phone_call_duration = (
                        duration_seconds
                    )

                    print(
                        "PHONE CALL DURATION SAVED:",
                        duration_seconds,
                        "seconds",
                    )

                else:

                    call.phone_call_duration = None

                    print(
                        "NO ACTUAL CALL DURATION."
                    )

            except (
                TypeError,
                ValueError,
            ) as error:

                print(
                    "INVALID CALL DURATION:",
                    repr(error),
                )

        print(
            "=========================================="
        )

        # ----------------------------------------------------
        # Update CRM Call Outcome
        # ----------------------------------------------------

        if call_status == "completed":

            # ------------------------------------------------
            # Completed + positive duration
            # = customer actually connected.
            # ------------------------------------------------

            if (
                call_duration is not None
                and str(call_duration).isdigit()
                and int(call_duration) > 0
            ):

                call.call_outcome = "connected"

            else:

                call.call_outcome = "no_answer"

        elif call_status == "no-answer":

            call.call_outcome = "no_answer"

            # No-answer should never have a duration.
            call.phone_call_duration = None

        elif call_status == "busy":

            call.call_outcome = "busy"

            # Busy should never have a duration.
            call.phone_call_duration = None

        elif call_status == "failed":

            call.call_outcome = "no_answer"

            # Failed should never have a duration.
            call.phone_call_duration = None

        elif call_status == "canceled":

            # Canceled calls are not connected.
            call.call_outcome = "no_answer"

            call.phone_call_duration = None

        # ----------------------------------------------------
        # Save Call
        # ----------------------------------------------------

        call.save()

        # ----------------------------------------------------
        # Debug saved values
        # ----------------------------------------------------

        print(
            "========== CALL SAVED =========="
        )

        print(
            "PHONE CALL STATUS:",
            call.phone_call_status,
        )

        print(
            "CALL OUTCOME:",
            call.call_outcome,
        )

        print(
            "PHONE CALL DURATION:",
            call.phone_call_duration,
        )

        print(
            "================================"
        )

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return Response(
            {
                "message": (
                    "Twilio webhook processed successfully."
                ),
                "call_id": call.id,
                "status": call.phone_call_status,
                "call_outcome": call.call_outcome,
                "phone_call_duration": (
                    call.phone_call_duration
                ),
            },
            status=status.HTTP_200_OK,
        )