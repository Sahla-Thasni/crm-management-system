from django.contrib import admin

from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "deal_name",
        "associated_lead",
        "deal_stage",
        "amount",
        "close_date",
        "priority",
        "is_active",
        "created_at",
    )

    list_filter = (
        "deal_stage",
        "priority",
        "is_active",
    )

    search_fields = (
        "deal_name",
        "associated_lead__first_name",
        "associated_lead__last_name",
        "associated_lead__email",
    )

    ordering = (
        "-created_at",
    )

    filter_horizontal = (
        "deal_owner",
    )

    autocomplete_fields = (
        "associated_lead",
        "created_by",
        "deal_owner",
    )

    list_select_related = (
        "associated_lead",
        "created_by",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 25
