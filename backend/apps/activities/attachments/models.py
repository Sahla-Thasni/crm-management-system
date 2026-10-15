from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from apps.companies.models import Company
from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.tickets.models import Ticket
from apps.users.models import CustomUser


# -------------------- Module -------------------- #

class Module(models.TextChoices):
    LEAD = "lead", "Lead"
    COMPANY = "company", "Company"
    DEAL = "deal", "Deal"
    TICKET = "ticket", "Ticket"


# -------------------- Attachment Model -------------------- #

class Attachment(models.Model):

    file = models.FileField(
        upload_to="attachments/",
        help_text="Upload an attachment file.",
    )

    file_name = models.CharField(
        max_length=255,
        blank=True,
    )

    file_size = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        help_text="File size in bytes.",
    )

    module = models.CharField(
        max_length=20,
        choices=Module.choices,
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        related_name="attachments",
        null=True,
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        related_name="attachments",
        null=True,
        blank=True,
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.SET_NULL,
        related_name="attachments",
        null=True,
        blank=True,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        related_name="attachments",
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_attachments",
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # -------------------- Meta -------------------- #

    class Meta:

        db_table = "attachments"

        verbose_name = "Attachment"

        verbose_name_plural = "Attachments"

        ordering = (
            "-created_at",
        )

        indexes = [
            models.Index(
                fields=["module"],
            ),
            models.Index(
                fields=["created_by"],
            ),
            models.Index(
                fields=["is_active"],
            ),
            models.Index(
                fields=["lead"],
            ),
            models.Index(
                fields=["company"],
            ),
            models.Index(
                fields=["deal"],
            ),
            models.Index(
                fields=["ticket"],
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=(
                    (
                        Q(lead__isnull=False)
                        & Q(company__isnull=True)
                        & Q(deal__isnull=True)
                        & Q(ticket__isnull=True)
                    )
                    |
                    (
                        Q(lead__isnull=True)
                        & Q(company__isnull=False)
                        & Q(deal__isnull=True)
                        & Q(ticket__isnull=True)
                    )
                    |
                    (
                        Q(lead__isnull=True)
                        & Q(company__isnull=True)
                        & Q(deal__isnull=False)
                        & Q(ticket__isnull=True)
                    )
                    |
                    (
                        Q(lead__isnull=True)
                        & Q(company__isnull=True)
                        & Q(deal__isnull=True)
                        & Q(ticket__isnull=False)
                    )
                ),
                name="attachment_exactly_one_related_object",
            ),
        ]

    # -------------------- Validation -------------------- #

    def clean(self):

        related_objects = (
            self.lead,
            self.company,
            self.deal,
            self.ticket,
        )

        selected_count = sum(
            obj is not None
            for obj in related_objects
        )

        if selected_count != 1:
            raise ValidationError(
                "Exactly one CRM association must be selected."
            )

        module_mapping = {
            Module.LEAD: self.lead,
            Module.COMPANY: self.company,
            Module.DEAL: self.deal,
            Module.TICKET: self.ticket,
        }

        if self.module not in module_mapping:
            raise ValidationError(
                {
                    "module": "Invalid module.",
                }
            )

        if module_mapping[self.module] is None:
            raise ValidationError(
                {
                    "module": (
                        "The selected module must match "
                        "the related CRM object."
                    ),
                }
            )

    # -------------------- Save -------------------- #

    def save(self, *args, **kwargs):

        if self.file:

            if not self.file_name:
                self.file_name = self.file.name

            if self.file_size is None:
                self.file_size = self.file.size

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    # -------------------- String Representation -------------------- #

    def __str__(self):

        related_object = (
            self.lead
            or self.company
            or self.deal
            or self.ticket
        )

        return (
            f"{self.file_name or self.file.name} | "
            f"{related_object or 'No Association'}"
        )