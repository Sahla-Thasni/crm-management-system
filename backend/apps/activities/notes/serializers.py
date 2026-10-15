from rest_framework import serializers

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser

from .models import Note


# -------------------- NoteUser Serializer -------------------- #

class NoteUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- NoteLead Serializer -------------------- #

class NoteLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead
        fields = (
            "id",
            "first_name",
            "last_name",
        )


# -------------------- NoteCompany Serializer -------------------- #

class NoteCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = (
            "id",
            "company_name",
        )


# -------------------- NoteDeal Serializer -------------------- #

class NoteDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal
        fields = (
            "id",
            "deal_name",
        )


# -------------------- NoteTicket Serializer -------------------- #

class NoteTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket
        fields = (
            "id",
            "ticket_name",
        )


# -------------------- Note Serializer -------------------- #

class NoteSerializer(serializers.ModelSerializer):

    created_by = NoteUserSerializer(
        read_only=True,
    )

    lead = NoteLeadSerializer(
        read_only=True,
    )

    company = NoteCompanySerializer(
        read_only=True,
    )

    deal = NoteDealSerializer(
        read_only=True,
    )

    ticket = NoteTicketSerializer(
        read_only=True,
    )

    class Meta:
        model = Note

        fields = (
            "id",
            "note",
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

    def validate_note(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Note cannot be empty."
            )

        return value