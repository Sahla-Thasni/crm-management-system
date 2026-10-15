from rest_framework import serializers

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser

from .models import Call


# -------------------- Call User Serializer -------------------- #

class CallUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- Call Lead Serializer -------------------- #

class CallLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead

        fields = (
            "id",
            "first_name",
            "last_name",
        )


# -------------------- Call Company Serializer -------------------- #

class CallCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company

        fields = (
            "id",
            "company_name",
        )


# -------------------- Call Deal Serializer -------------------- #

class CallDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal

        fields = (
            "id",
            "deal_name",
        )


# -------------------- Call Ticket Serializer -------------------- #

class CallTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket

        fields = (
            "id",
            "ticket_name",
        )


# -------------------- Call Serializer -------------------- #

class CallSerializer(serializers.ModelSerializer):

    created_by = CallUserSerializer(
        read_only=True,
    )

    lead = CallLeadSerializer(
        read_only=True,
    )

    company = CallCompanySerializer(
        read_only=True,
    )

    deal = CallDealSerializer(
        read_only=True,
    )

    ticket = CallTicketSerializer(
        read_only=True,
    )

    class Meta:
        model = Call

        fields = (
            "id",
            "note",
            "call_outcome",
            "call_date",
            "call_time",
            "duration",

            # Phone call integration
            "phone_number",
            "phone_call_status",
            "twilio_call_sid",
            "phone_call_started_at",
            "phone_call_ended_at",
            "phone_call_duration",

            "module",
            "lead",
            "company",
            "deal",
            "ticket",
            "created_by",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "module",
            "lead",
            "company",
            "deal",
            "ticket",
            "created_by",

            # Managed by the backend/Twilio
            "call_outcome",
            "phone_call_status",
            "twilio_call_sid",
            "phone_call_started_at",
            "phone_call_ended_at",
            "phone_call_duration",

            "created_at",
            "updated_at",
        )

    # -------------------- Note Validation -------------------- #

    def validate_note(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Note cannot be empty."
            )

        return value

    # -------------------- Call Validation -------------------- #

    def validate(self, attrs):

        call_date = attrs.get("call_date")
        call_time = attrs.get("call_time")
        duration = attrs.get("duration")

        if call_date is None:
            raise serializers.ValidationError(
                {
                    "call_date": "Call date is required."
                }
            )

        if call_time is None:
            raise serializers.ValidationError(
                {
                    "call_time": "Call time is required."
                }
            )

        return attrs