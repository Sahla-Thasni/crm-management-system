from rest_framework import serializers

from apps.users.models import CustomUser
from apps.products.models import Product
from apps.companies.models import Company

from .models import Lead


# -------------------- Contact Owner Serializer -------------------- #

class ContactOwnerSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
        )


# -------------------- Product Summary Serializer -------------------- #

class ProductSummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "sku",
            "unit_price",
        )


# -------------------- Company Summary Serializer -------------------- #

class CompanySummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = (
            "id",
            "company_name",
            "email",
            "phone_number",
        )


# -------------------- Lead Serializer -------------------- #

class LeadSerializer(serializers.ModelSerializer):

    contact_owner_details = ContactOwnerSerializer(
        source="contact_owner",
        many=True,
        read_only=True,
    )

    product_details = ProductSummarySerializer(
        source="products",
        many=True,
        read_only=True,
    )

    company_details = CompanySummarySerializer(
        source="company",
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = Lead
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "job_title",

            "contact_owner",
            "contact_owner_details",

            "products",
            "product_details",

            "company",
            "company_details",

            "city",

            "lead_status",
            "lead_date",

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

    def validate_email(self, value):
        value = value.strip().lower()

        queryset = Lead.objects.filter(
            email__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Lead with this email already exists."
            )

        return value

    def validate_first_name(self, value):
        return value.strip()

    def validate_last_name(self, value):
        return value.strip()

    def validate_phone_number(self, value):
        return value.strip()

    def validate_job_title(self, value):
        return value.strip()

    def validate_city(self, value):
        return value.strip()
# =====================================================
# LEAD IMPORT SERIALIZER
# =====================================================

class LeadImportSerializer(serializers.Serializer):

    file = serializers.FileField()

    def validate_file(self, value):

        # ---------------------------------------------
        # FILE EXTENSION
        # ---------------------------------------------

        filename = value.name.lower()

        if not filename.endswith(".csv"):

            raise serializers.ValidationError(
                "Only CSV files are supported."
            )

        # ---------------------------------------------
        # EMPTY FILE
        # ---------------------------------------------

        if value.size == 0:

            raise serializers.ValidationError(
                "The uploaded CSV file is empty."
            )

        # ---------------------------------------------
        # FILE SIZE
        # ---------------------------------------------

        max_size = 5 * 1024 * 1024

        if value.size > max_size:

            raise serializers.ValidationError(
                "CSV file size cannot exceed 5 MB."
            )

        return value   