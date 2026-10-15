from django.contrib import admin

from .models import Task


# -------------------- Task Admin -------------------- #

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "task_type",
        "priority",
        "module",
        "get_related_object",
        "due_date",
        "due_time",
        "is_active",
        "created_at",
    )

    list_filter = (
        "task_type",
        "priority",
        "module",
        "assigned_to",
        "is_active",
        "due_date",
        "created_at",
    )

    search_fields = (
        "title",
        "note",
        "assigned_to__first_name",
        "assigned_to__last_name",
        "assigned_to__email",
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
            "Task Information",
            {
                "fields": (
                    "title",
                    "note",
                    "due_date",
                    "due_time",
                    "task_type",
                    "priority",
                    "assigned_to",
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

    # -------------------------------------------------------- #
    # Custom Display
    # -------------------------------------------------------- #

    @admin.display(
        description="Related Object",
    )
    def get_related_object(self, obj):

        if obj.lead:
            return f"Lead: {obj.lead}"

        if obj.company:
            return f"Company: {obj.company}"

        if obj.deal:
            return f"Deal: {obj.deal}"

        if obj.ticket:
            return f"Ticket: {obj.ticket}"

        return "No Association"