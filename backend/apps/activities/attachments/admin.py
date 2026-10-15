from django.contrib import admin
from django.utils.html import format_html

from .models import Attachment


# -------------------- Attachment Admin -------------------- #

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "file_name",
        "file_size_display",
        "module",
        "get_related_object",
        "created_by",
        "is_active",
        "created_at",
    )

    list_filter = (
        "module",
        "is_active",
        "created_at",
    )

    search_fields = (
        "file_name",
        "file",
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
        "file_name",
        "file_size",
        "file_preview",
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
            "Attachment Information",
            {
                "fields": (
                    "file",
                    "file_preview",
                    "file_name",
                    "file_size",
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

    # -------------------- File Preview -------------------- #

    @admin.display(
        description="File",
    )
    def file_preview(self, obj):

        if not obj or not obj.file:
            return "-"

        return format_html(
            '<a href="{}" target="_blank">Open File</a>',
            obj.file.url,
        )

    # -------------------- File Size -------------------- #

    @admin.display(
        description="File Size",
    )
    def file_size_display(self, obj):

        if obj.file_size is None:
            return "-"

        size = obj.file_size

        if size < 1024:
            return f"{size} B"

        if size < 1024 ** 2:
            return f"{size / 1024:.1f} KB"

        if size < 1024 ** 3:
            return f"{size / (1024 ** 2):.1f} MB"

        return f"{size / (1024 ** 3):.1f} GB"

    # -------------------- Related Object -------------------- #

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