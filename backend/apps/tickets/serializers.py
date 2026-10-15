from rest_framework import serializers

from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.users.models import CustomUser

from .models import Ticket


# -------------------- Ticket Owner Serializer -------------------- #

class TicketOwnerSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
        )


# -------------------- Associated Lead Serializer -------------------- #

class AssociatedLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
        )


# -------------------- Associated Deal Serializer -------------------- #

class AssociatedDealSerializer(serializers.ModelSerializer):

    associated_lead = AssociatedLeadSerializer(
        read_only=True,
    )

    class Meta:
        model = Deal
        fields = (
            "id",
            "deal_name",
            "associated_lead",
        )


# -------------------- Ticket Serializer -------------------- #

class TicketSerializer(serializers.ModelSerializer):

    associated_deal_details = AssociatedDealSerializer(
        source="associated_deal",
        read_only=True,
    )

    ticket_owner_details = TicketOwnerSerializer(
        source="ticket_owner",
        many=True,
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = Ticket
        fields = (
            "id",
            "ticket_name",
            "description",
            "associated_deal",
            "associated_deal_details",
            "ticket_status",
            "source",
            "priority",
            "ticket_owner",
            "ticket_owner_details",
            "created_by",
            "created_by_name",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_by",
            "created_at",
            "updated_at",
        )

    def validate_ticket_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Ticket name cannot be empty."
            )

        return value

    def validate_description(self, value):
        if value:
            value = value.strip()

        return value