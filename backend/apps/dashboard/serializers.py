from rest_framework import serializers

from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.users.models import CustomUser


# ==========================================================
# Dashboard Lead Serializer
# ==========================================================

class DashboardLeadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead

        fields = (
            "id",
            "lead_status",
        )


# ==========================================================
# Dashboard Deal Owner Serializer
# ==========================================================

class DashboardDealOwnerSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


# ==========================================================
# Dashboard Deal Serializer
# ==========================================================

class DashboardDealSerializer(serializers.ModelSerializer):

    deal_owner_details = DashboardDealOwnerSerializer(
        source="deal_owner",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Deal

        fields = (
            "id",
            "deal_name",
            "deal_stage",
            "amount",
            "close_date",
            "deal_owner_details",
        )


# ==========================================================
# Dashboard User Serializer
# ==========================================================

class DashboardUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )