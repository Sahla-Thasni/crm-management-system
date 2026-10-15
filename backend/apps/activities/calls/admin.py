from django.contrib import admin

from .models import Call


# -------------------- Call Admin -------------------- #

@admin.register(Call)
class CallAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "call_outcome",
        "module",
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
        "call_date",
        "call_time",
        "duration",
        "is_active",
        "created_at",
    )

    list_filter = (
        "call_outcome",
        "module",
        "duration",
        "is_active",
        "call_date",
        "created_at",
    )

    search_fields = (
        "note",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
        "lead__first_name",
        "lead__last_name",
        "company__company_name",
        "deal__deal_name",
        "ticket__ticket_name",
    )

    autocomplete_fields = (
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )

    list_select_related = (
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    date_hierarchy = "created_at"

    list_per_page = 25

    empty_value_display = "-"

    fieldsets = (
        (
            "Call Information",
            {
                "fields": (
                    "call_outcome",
                    "call_date",
                    "call_time",
                    "duration",
                    "note",
                ),
            },
        ),
        (
            "Related Module",
            {
                "fields": (
                    "module",
                    "lead",
                    "company",
                    "deal",
                    "ticket",
                ),
            },
        ),
        (
            "Additional Information",
            {
                "fields": (
                    "created_by",
                    "is_active",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )