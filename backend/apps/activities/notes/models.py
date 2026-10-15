from django.db import models

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


# -------------------- Note Model -------------------- #

class Note(models.Model):

    note = models.TextField()

    module = models.CharField(
        max_length=20,
        choices=Module.choices,
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_notes",
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

    class Meta:
        db_table = "notes"
        verbose_name = "Note"
        verbose_name_plural = "Notes"
        ordering = ("-created_at",)

    def __str__(self):
        return self.note[:50]