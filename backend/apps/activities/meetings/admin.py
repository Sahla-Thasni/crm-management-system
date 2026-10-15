from django.contrib import admin

from .models import Meeting


# -------------------- Meeting Admin -------------------- #

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "module",
        "get_related_object",
        "created_by",
        "start_date",
        "start_time",
        "end_time",
        "get_attendees",
        "reminder",
        "is_active",
        "created_at",
    )

    list_filter = (
        "module",
        "reminder",
        "start_date",
        "is_active",
        "created_at",
    )

    search_fields = (
        "title",
        "note",
        "location",
        "created_by__first_name",
        "created_by__last_name",
        "created_by__email",
        "lead__first_name",
        "lead__last_name",
        "company__company_name",
        "deal__deal_name",
        "ticket__ticket_name",
        "attendees__first_name",
        "attendees__last_name",
        "attendees__email",
    )

    autocomplete_fields = (
        "created_by",
        "attendees",
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
            "Meeting Information",
            {
                "fields": (
                    "title",
                    "note",
                    "start_date",
                    "start_time",
                    "end_time",
                    "attendees",
                    "location",
                    "reminder",
                ),
            },
        ),
        (
            "CRM Association",
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
            "User & Status",
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

    # -------------------- Custom Display -------------------- #

    @admin.display(
        description="Related Object",
    )
    def get_related_object(
        self,
        obj,
    ):

        if obj.lead:
            return f"Lead: {obj.lead}"

        if obj.company:
            return f"Company: {obj.company}"

        if obj.deal:
            return f"Deal: {obj.deal}"

        if obj.ticket:
            return f"Ticket: {obj.ticket}"

        return "No Association"

    # -------------------- Attendees Display -------------------- #

    @admin.display(
        description="Attendees",
    )
    def get_attendees(
        self,
        obj,
    ):

        attendees = obj.attendees.all()

        if not attendees:
            return "-"

        return ", ".join(
            (
                f"{user.first_name} {user.last_name}".strip()
                or user.email
            )
            for user in attendees
        )