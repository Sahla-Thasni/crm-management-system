from rest_framework import serializers

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser

from .models import Email, EmailAttachment


# -------------------- Email User Serializer -------------------- #

class EmailUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- Email Lead Serializer -------------------- #

class EmailLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead

        fields = (
            "id",
            "first_name",
            "last_name",
        )


# -------------------- Email Company Serializer -------------------- #

class EmailCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company

        fields = (
            "id",
            "company_name",
        )


# -------------------- Email Deal Serializer -------------------- #

class EmailDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal

        fields = (
            "id",
            "deal_name",
        )


# -------------------- Email Ticket Serializer -------------------- #

class EmailTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket

        fields = (
            "id",
            "ticket_name",
        )


# -------------------- Email Attachment Serializer -------------------- #

class EmailAttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailAttachment

        fields = (
            "id",
            "file",
            "file_name",
            "file_size",
            "uploaded_at",
        )

        read_only_fields = (
            "id",
            "file_name",
            "file_size",
            "uploaded_at",
        )


# -------------------- Email Serializer -------------------- #

class EmailSerializer(serializers.ModelSerializer):

    created_by = EmailUserSerializer(
        read_only=True,
    )

    lead = EmailLeadSerializer(
        read_only=True,
    )

    company = EmailCompanySerializer(
        read_only=True,
    )

    deal = EmailDealSerializer(
        read_only=True,
    )

    ticket = EmailTicketSerializer(
        read_only=True,
    )

    attachments = EmailAttachmentSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Email

        fields = (
            "id",
            "recipients",
            "cc",
            "bcc",
            "subject",
            "body",
            "status",
            "sent_at",
            "module",
            "lead",
            "company",
            "deal",
            "ticket",
            "created_by",
            "attachments",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "status",
            "sent_at",
            "module",
            "lead",
            "company",
            "deal",
            "ticket",
            "created_by",
            "attachments",
            "is_active",
            "created_at",
            "updated_at",
        )

    # -------------------- Recipients Validation -------------------- #

    def validate_recipients(self, value):

        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Recipients must be a list of email addresses."
            )

        if not value:
            raise serializers.ValidationError(
                "At least one recipient is required."
            )

        validated_emails = []

        for email in value:

            if not isinstance(email, str):
                raise serializers.ValidationError(
                    "Each recipient must be a valid email address."
                )

            email = email.strip()

            if not email:
                raise serializers.ValidationError(
                    "Recipient email cannot be empty."
                )

            email_field = serializers.EmailField()

            validated_email = email_field.run_validation(
                email
            )

            validated_emails.append(
                validated_email
            )

        return validated_emails

    # -------------------- CC Validation -------------------- #

    def validate_cc(self, value):

        return self._validate_email_list(
            value,
            "CC",
        )

    # -------------------- BCC Validation -------------------- #

    def validate_bcc(self, value):

        return self._validate_email_list(
            value,
            "BCC",
        )

    # -------------------- Email List Validation -------------------- #

    def _validate_email_list(
        self,
        value,
        field_name,
    ):

        if value is None:
            return []

        if not isinstance(value, list):
            raise serializers.ValidationError(
                f"{field_name} must be a list of email addresses."
            )

        validated_emails = []

        for email in value:

            if not isinstance(email, str):
                raise serializers.ValidationError(
                    f"Each {field_name} address must be a valid email."
                )

            email = email.strip()

            if not email:
                raise serializers.ValidationError(
                    f"{field_name} email cannot be empty."
                )

            email_field = serializers.EmailField()

            validated_email = email_field.run_validation(
                email
            )

            validated_emails.append(
                validated_email
            )

        return validated_emails

    # -------------------- Subject Validation -------------------- #

    def validate_subject(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Subject cannot be empty."
            )

        return value

    # -------------------- Body Validation -------------------- #

    def validate_body(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Email body cannot be empty."
            )

        return value