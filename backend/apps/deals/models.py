from django.db import models

from apps.leads.models import Lead
from apps.users.models import CustomUser


# -------------------- Deal Stage -------------------- #

class DealStage(models.TextChoices):
    PROPOSAL_SENT = "Proposal Sent", "Proposal Sent"
    NEGOTIATION = "Negotiation", "Negotiation"
    CLOSED_WON = "Closed Won", "Closed Won"
    CLOSED_LOST = "Closed Lost", "Closed Lost"


# -------------------- Priority -------------------- #

class Priority(models.TextChoices):
    LOW = "Low", "Low"
    MEDIUM = "Medium", "Medium"
    HIGH = "High", "High"


# -------------------- Deal Model -------------------- #

class Deal(models.Model):

    deal_name = models.CharField(
        max_length=255,
    )

    associated_lead = models.ForeignKey(
        Lead,
        on_delete=models.PROTECT,
        related_name="deals",
    )

    deal_stage = models.CharField(
        max_length=30,
        choices=DealStage.choices,
        default=DealStage.PROPOSAL_SENT,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    deal_owner = models.ManyToManyField(
        CustomUser,
        related_name="assigned_deals",
    )

    close_date = models.DateField()

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_deals",
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
        db_table = "deals"
        verbose_name = "Deal"
        verbose_name_plural = "Deals"
        ordering = ["-created_at"]

    def __str__(self):
        return self.deal_name