from rest_framework import serializers

from .models import Company, CompanyType, Industry


# -------------------- Industry Serializer -------------------- #

class IndustrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Industry
        fields = (
            "id",
            "name",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        value = value.strip()

        queryset = Industry.objects.filter(
            name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Industry with this name already exists."
            )

        return value


# -------------------- Company Type Serializer -------------------- #

class CompanyTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = CompanyType
        fields = (
            "id",
            "name",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        value = value.strip()

        queryset = CompanyType.objects.filter(
            name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Company type already exists."
            )

        return value


# -------------------- Company Serializer -------------------- #

class CompanySerializer(serializers.ModelSerializer):

    # company_owner is a ManyToManyField,
    # so we need to return the names of all owners.
    company_owner_name = serializers.SerializerMethodField()

    industry_name = serializers.CharField(
        source="industry.name",
        read_only=True,
    )

    company_type_name = serializers.CharField(
        source="company_type.name",
        read_only=True,
    )

    class Meta:
        model = Company

        fields = (
            "id",
            "company_name",
            "domain_name",
            "email",
            "phone_number",
            "company_owner",
            "company_owner_name",
            "industry",
            "industry_name",
            "company_type",
            "company_type_name",
            "city",
            "country",
            "number_of_employees",
            "annual_revenue",
            "created_by",
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

    def get_company_owner_name(self, obj):
        """
        Return all company owner names.

        If a user has a full name, use it.
        Otherwise, use the user's email.
        """

        return ", ".join(
            owner.get_full_name() or owner.email
            for owner in obj.company_owner.all()
        )

    def validate_company_name(self, value):
        return value.strip()

    def validate_domain_name(self, value):
        value = value.strip().lower()

        queryset = Company.objects.filter(
            domain_name__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Company domain already exists."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        queryset = Company.objects.filter(
            email__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Company email already exists."
            )

        return value

    def validate_phone_number(self, value):
        return value.strip()

    def validate_number_of_employees(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Number of employees cannot be negative."
            )

        return value

    def validate_annual_revenue(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Annual revenue cannot be negative."
            )

        return value
    # =====================================================
# COMPANY IMPORT SERIALIZER
# =====================================================

class CompanyImportSerializer(serializers.Serializer):

    file = serializers.FileField()

    def validate_file(self, value):

        # ---------------------------------------------
        # File extension
        # ---------------------------------------------

        filename = value.name.lower()

        if not filename.endswith(".csv"):
            raise serializers.ValidationError(
                "Only CSV files are supported."
            )

        # ---------------------------------------------
        # Empty file
        # ---------------------------------------------

        if value.size == 0:
            raise serializers.ValidationError(
                "The uploaded CSV file is empty."
            )

        # ---------------------------------------------
        # File size
        # ---------------------------------------------

        max_size = 5 * 1024 * 1024  # 5 MB

        if value.size > max_size:
            raise serializers.ValidationError(
                "CSV file size cannot exceed 5 MB."
            )

        return value