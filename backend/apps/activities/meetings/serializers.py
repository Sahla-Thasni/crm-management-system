from rest_framework import serializers

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser

from .models import Meeting


# -------------------- Meeting User Serializer -------------------- #

class MeetingUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- Meeting Lead Serializer -------------------- #

class MeetingLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead

        fields = (
            "id",
            "first_name",
            "last_name",
        )


# -------------------- Meeting Company Serializer -------------------- #

class MeetingCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company

        fields = (
            "id",
            "company_name",
        )


# -------------------- Meeting Deal Serializer -------------------- #

class MeetingDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal

        fields = (
            "id",
            "deal_name",
        )


# -------------------- Meeting Ticket Serializer -------------------- #

class MeetingTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket

        fields = (
            "id",
            "ticket_name",
        )


# -------------------- Meeting Serializer -------------------- #

class MeetingSerializer(serializers.ModelSerializer):

    created_by = MeetingUserSerializer(
        read_only=True,
    )
    attendees = MeetingUserSerializer(
        many=True,
        read_only=True,
    )

    lead = MeetingLeadSerializer(
        read_only=True,
    )

    company = MeetingCompanySerializer(
        read_only=True,
    )

    deal = MeetingDealSerializer(
        read_only=True,
    )

    ticket = MeetingTicketSerializer(
        read_only=True,
    )

    class Meta:
        model = Meeting

        fields = (
            "id",
            "title",
            "note",
            "start_date",
            "start_time",
            "end_time",
            "attendees",
            "location",
            "reminder",
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
            "created_at",
            "updated_at",
        )

    # -------------------- Title Validation -------------------- #

    def validate_title(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return value

    # -------------------- Note Validation -------------------- #

    def validate_note(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Note cannot be empty."
            )

        return value

    # -------------------- Meeting Validation -------------------- #

    def validate(self, attrs):

        start_time = attrs.get(
            "start_time",
            getattr(
                self.instance,
                "start_time",
                None,
            ),
        )

        end_time = attrs.get(
            "end_time",
            getattr(
                self.instance,
                "end_time",
                None,
            ),
        )

        if (
            start_time
            and end_time
            and end_time <= start_time
        ):
            raise serializers.ValidationError(
                {
                    "end_time": (
                        "End time must be after start time."
                    )
                }
            )

        return attrs
