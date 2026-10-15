from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from apps.leads.models import Lead, LeadStatus
from apps.users.models import CustomUser

from .models import Deal


# -------------------- Deal Owner Serializer -------------------- #

class DealOwnerSerializer(serializers.ModelSerializer):

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


# -------------------- Deal Serializer -------------------- #

class DealSerializer(serializers.ModelSerializer):

    associated_lead_details = AssociatedLeadSerializer(
        source="associated_lead",
        read_only=True,
    )

    deal_owner_details = DealOwnerSerializer(
        source="deal_owner",
        many=True,
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = Deal

        fields = (
            "id",

            "deal_name",

            "associated_lead",
            "associated_lead_details",

            "deal_stage",

            "amount",

            "deal_owner",
            "deal_owner_details",

            "close_date",

            "priority",

            "created_by",
            "created_by_name",

            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "amount",
            "created_by",
            "created_at",
            "updated_at",
        )

    # -------------------------------------------------
    # CALCULATE DEAL AMOUNT
    # -------------------------------------------------

    def calculate_deal_amount(self, lead):

        total = (
            lead.products.aggregate(
                total=Sum("unit_price")
            )["total"]
        )

        return total or Decimal("0.00")

    # -------------------------------------------------
    # VALIDATE DEAL NAME
    # -------------------------------------------------

    def validate_deal_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Deal name cannot be empty."
            )

        return value

    # -------------------------------------------------
    # VALIDATE ASSOCIATED LEAD
    # -------------------------------------------------

    def validate_associated_lead(self, value):

        # Allow an existing deal to keep
        # its current associated lead during Edit.

        if (
            self.instance
            and self.instance.associated_lead_id == value.id
        ):
            return value

        # A lead must be Qualified before
        # it can be converted into a Deal.

        if value.lead_status != LeadStatus.QUALIFIED:

            raise serializers.ValidationError(
                "Only qualified leads can be converted into deals."
            )

        # Prevent another active deal from
        # using the same lead.

        queryset = Deal.objects.filter(
            associated_lead=value,
            is_active=True,
        )

        if self.instance:

            queryset = queryset.exclude(
                pk=self.instance.pk,
            )

        if queryset.exists():

            raise serializers.ValidationError(
                "A deal already exists for this lead."
            )

        return value

    # -------------------------------------------------
    # CREATE
    # -------------------------------------------------

    def create(self, validated_data):

        lead = validated_data["associated_lead"]

        # Automatically calculate amount
        # from Lead's selected products.

        validated_data["amount"] = (
            self.calculate_deal_amount(lead)
        )

        return super().create(validated_data)

    # -------------------------------------------------
    # UPDATE
    # -------------------------------------------------

    def update(self, instance, validated_data):

        lead = validated_data.get(
            "associated_lead",
            instance.associated_lead,
        )

        # Recalculate amount every time the deal
        # is updated.

        validated_data["amount"] = (
            self.calculate_deal_amount(lead)
        )

        return super().update(
            instance,
            validated_data,
        )