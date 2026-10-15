from django.contrib import admin

from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "lead_status",
        "company",
        "lead_date",
        "is_active",
        "created_at",
    )

    list_filter = (
        "lead_status",
        "company",
        "is_active",
    )

    search_fields = (
        "first_name",
        "last_name",
        "email",
        "phone_number",
    )

    ordering = (
        "-created_at",
    )

    filter_horizontal = (
        "contact_owner",
        "products",
    )

    autocomplete_fields = (
        "company",
        "created_by",
        "products",
        "contact_owner",
    )

    list_select_related = (
        "company",
        "created_by",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 25
