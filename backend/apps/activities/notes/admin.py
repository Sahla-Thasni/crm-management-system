from django.contrib import admin

from .models import Note


# -------------------- Note Admin -------------------- #

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "module",
        "created_by",
        "lead",
        "company",
        "deal",
        "ticket",
        "is_active",
        "created_at",
    )

    list_filter = (
        "module",
        "is_active",
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

    fieldsets = (
        (
            "Note Information",
            {
                "fields": (
                    "note",
                    "module",
                    "created_by",
                    "is_active",
                ),
            },
        ),
        (
            "Related Module",
            {
                "fields": (
                    "lead",
                    "company",
                    "deal",
                    "ticket",
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
