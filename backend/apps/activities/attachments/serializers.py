from rest_framework import serializers

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser

from .models import Attachment


# -------------------- Attachment User Serializer -------------------- #

class AttachmentUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- Attachment Lead Serializer -------------------- #

class AttachmentLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead

        fields = (
            "id",
            "first_name",
            "last_name",
        )


# -------------------- Attachment Company Serializer -------------------- #

class AttachmentCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company

        fields = (
            "id",
            "company_name",
        )


# -------------------- Attachment Deal Serializer -------------------- #

class AttachmentDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal

        fields = (
            "id",
            "deal_name",
        )


# -------------------- Attachment Ticket Serializer -------------------- #

class AttachmentTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket

        fields = (
            "id",
            "ticket_name",
        )


# -------------------- Attachment Serializer -------------------- #

class AttachmentSerializer(serializers.ModelSerializer):

    file = serializers.FileField(
        allow_empty_file=False,
    )

    file_url = serializers.SerializerMethodField()

    created_by = AttachmentUserSerializer(
        read_only=True,
    )

    lead = AttachmentLeadSerializer(
        read_only=True,
    )

    company = AttachmentCompanySerializer(
        read_only=True,
    )

    deal = AttachmentDealSerializer(
        read_only=True,
    )

    ticket = AttachmentTicketSerializer(
        read_only=True,
    )

    class Meta:

        model = Attachment

        fields = (
            "id",
            "file",
            "file_url",
            "file_name",
            "file_size",
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
            "file_url",
            "file_name",
            "file_size",
            "module",
            "lead",
            "company",
            "deal",
            "ticket",
            "created_by",
            "created_at",
            "updated_at",
        )

    # -------------------- File URL -------------------- #

    def get_file_url(self, obj):

        if not obj.file:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.file.url,
            )

        return obj.file.url