from django.contrib import admin

from .models import Company, CompanyType, Industry


# -------------------- Industry Admin -------------------- #
@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )


# -------------------- Company Type Admin -------------------- #
@admin.register(CompanyType)
class CompanyTypeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )


# -------------------- Company Admin -------------------- #
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company_name",
        "email",
        "phone_number",
        "get_company_owners",
        "industry",
        "company_type",
        "city",
        "country",
        "is_active",
        "created_at",
    )

    list_filter = (
        "company_owner",
        "industry",
        "company_type",
        "country",
        "is_active",
    )

    search_fields = (
        "company_name",
        "email",
        "phone_number",
        "city",
        "domain_name",
    )

    autocomplete_fields = (
        "company_owner",
        "created_by",
    )

    list_select_related = (
        "industry",
        "company_type",
        "created_by",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    date_hierarchy = "created_at"

    ordering = (
        "-created_at",
    )

    list_per_page = 25

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "industry",
                "company_type",
                "created_by",
            )
            .prefetch_related(
                "company_owner",
            )
        )

    @admin.display(description="Company Owners")
    def get_company_owners(self, obj):
        return ", ".join(
            owner.get_full_name() or owner.email
            for owner in obj.company_owner.all()
        )
