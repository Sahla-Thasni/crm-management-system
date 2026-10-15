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


# -------------------- Email Status -------------------- #

class EmailStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENDING = "sending", "Sending"
    SENT = "sent", "Sent"
    FAILED = "failed", "Failed"


# -------------------- Email Model -------------------- #

class Email(models.Model):

    recipients = models.JSONField(
        help_text="List of recipient email addresses.",
    )

    cc = models.JSONField(
        default=list,
        blank=True,
        help_text="List of CC email addresses.",
    )

    bcc = models.JSONField(
        default=list,
        blank=True,
        help_text="List of BCC email addresses.",
    )

    subject = models.CharField(
        max_length=255,
    )

    body = models.TextField(
        help_text="Email body content.",
    )

    status = models.CharField(
        max_length=20,
        choices=EmailStatus.choices,
        default=EmailStatus.DRAFT,
    )

    sent_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    module = models.CharField(
        max_length=20,
        choices=Module.choices,
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        related_name="emails",
        null=True,
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        related_name="emails",
        null=True,
        blank=True,
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.SET_NULL,
        related_name="emails",
        null=True,
        blank=True,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        related_name="emails",
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_emails",
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

        db_table = "emails"

        verbose_name = "Email"

        verbose_name_plural = "Emails"

        ordering = (
            "-created_at",
        )

        indexes = [
            models.Index(
                fields=["module"],
            ),
            models.Index(
                fields=["status"],
            ),
            models.Index(
                fields=["sent_at"],
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
                name="email_exactly_one_related_object",
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
                    "module": "Invalid module."
                }
            )

        if module_mapping[self.module] is None:
            raise ValidationError(
                {
                    "module": (
                        "The selected module must match "
                        "the related CRM object."
                    )
                }
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
            f"{self.subject} | "
            f"{related_object or 'No Association'}"
        )


# -------------------- Email Attachment Model -------------------- #

class EmailAttachment(models.Model):

    email = models.ForeignKey(
        Email,
        on_delete=models.CASCADE,
        related_name="attachments",
    )

    file = models.FileField(
        upload_to="email_attachments/",
    )

    file_name = models.CharField(
        max_length=255,
        blank=True,
    )

    file_size = models.PositiveBigIntegerField(
        null=True,
        blank=True,
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        db_table = "email_attachments"

        verbose_name = "Email Attachment"

        verbose_name_plural = "Email Attachments"

        ordering = (
            "-uploaded_at",
        )

    def __str__(self):

        return self.file_name or self.file.name