from django.contrib import admin

from .models import Email, EmailAttachment


# -------------------- Email Admin -------------------- #

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "subject",
        "status",
        "module",
        "get_related_object",
        "created_by",
        "sent_at",
        "is_active",
        "created_at",
    )

    list_filter = (
        "status",
        "module",
        "is_active",
        "sent_at",
        "created_at",
    )

    search_fields = (
        "subject",
        "body",
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
        "sent_at",
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
            "Email Information",
            {
                "fields": (
                    "recipients",
                    "cc",
                    "bcc",
                    "subject",
                    "body",
                    "status",
                    "sent_at",
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


# -------------------- Email Attachment Admin -------------------- #

@admin.register(EmailAttachment)
class EmailAttachmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "email",
        "file_name",
        "file_size",
        "uploaded_at",
    )

    search_fields = (
        "file_name",
        "email__subject",
    )

    autocomplete_fields = (
        "email",
    )

    readonly_fields = (
        "file_name",
        "file_size",
        "uploaded_at",
    )

    ordering = (
        "-uploaded_at",
    )

    list_per_page = 25