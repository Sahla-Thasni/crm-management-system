from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ticket_name",
        "associated_deal",
        "ticket_status",
        "source",
        "priority",
        "is_active",
        "created_at",
    )

    list_filter = (
        "ticket_status",
        "source",
        "priority",
        "is_active",
        "created_at",
    )

    search_fields = (
        "ticket_name",
        "associated_deal__deal_name",
        "associated_deal__associated_lead__first_name",
        "associated_deal__associated_lead__last_name",
        "associated_deal__associated_lead__email",
    )

    ordering = (
        "-created_at",
    )

    filter_horizontal = (
        "ticket_owner",
    )

    autocomplete_fields = (
        "associated_deal",
        "created_by",
    )

    list_select_related = (
        "associated_deal",
        "created_by",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 25