from rest_framework import serializers

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser

from .models import Task


# -------------------- Task User Serializer -------------------- #

class TaskUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- Assigned User Serializer -------------------- #

class AssignedUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# -------------------- Task Lead Serializer -------------------- #

class TaskLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead

        fields = (
            "id",
            "first_name",
            "last_name",
        )


# -------------------- Task Company Serializer -------------------- #

class TaskCompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company

        fields = (
            "id",
            "company_name",
        )


# -------------------- Task Deal Serializer -------------------- #

class TaskDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal

        fields = (
            "id",
            "deal_name",
        )


# -------------------- Task Ticket Serializer -------------------- #

class TaskTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket

        fields = (
            "id",
            "ticket_name",
        )


# -------------------- Task Serializer -------------------- #

class TaskSerializer(serializers.ModelSerializer):

    created_by = TaskUserSerializer(
        read_only=True,
    )

    assigned_to = AssignedUserSerializer(
        many=True,
        read_only=True,
    )

    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source="assigned_to",
        many=True,
        write_only=True,
    )

    lead = TaskLeadSerializer(
        read_only=True,
    )

    company = TaskCompanySerializer(
        read_only=True,
    )

    deal = TaskDealSerializer(
        read_only=True,
    )

    ticket = TaskTicketSerializer(
        read_only=True,
    )

    class Meta:
        model = Task

        fields = (
            "id",
            "title",
            "note",
            "due_date",
            "due_time",
            "task_type",
            "priority",
            "assigned_to",
            "assigned_to_ids",
            "module",
            "lead",
            "company",
            "deal",
            "ticket",
            "created_by",
            "is_active",
            "completed", 
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

        if value:
            value = value.strip()

            if not value:
                raise serializers.ValidationError(
                    "Note cannot contain only whitespace."
                )

        return value

    # -------------------- Due Date Validation -------------------- #

    def validate_due_date(self, value):

        if value is None:
            raise serializers.ValidationError(
                "Due date is required."
            )

        return value

    # -------------------- Due Time Validation -------------------- #

    def validate_due_time(self, value):

        if value is None:
            raise serializers.ValidationError(
                "Due time is required."
            )

        return value