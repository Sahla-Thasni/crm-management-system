from django.db import models  # type: ignore[import]

from apps.deals.models import Deal
from apps.users.models import CustomUser


# -------------------- Ticket Status -------------------- #

class TicketStatus(models.TextChoices):
    NEW = "New", "New"
    OPEN = "Open", "Open"
    WAITING_ON_CONTACT = "Waiting on contact", "Waiting on contact"
    WAITING_ON_US = "Waiting on us", "Waiting on us"
    CLOSED = "Closed", "Closed"


# -------------------- Ticket Priority -------------------- #

class TicketPriority(models.TextChoices):
    LOW = "Low", "Low"
    MEDIUM = "Medium", "Medium"
    HIGH = "High", "High"
    CRITICAL = "Critical", "Critical"


# -------------------- Ticket Source -------------------- #

class TicketSource(models.TextChoices):
    EMAIL = "Email", "Email"
    PHONE = "Phone", "Phone"
    CHAT = "Chat", "Chat"


# -------------------- Ticket Model -------------------- #

class Ticket(models.Model):

    ticket_name = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    associated_deal = models.ForeignKey(
        Deal,
        on_delete=models.PROTECT,
        related_name="tickets",
    )

    ticket_owner = models.ManyToManyField(
        CustomUser,
        related_name="assigned_tickets",
    )

    ticket_status = models.CharField(
        max_length=30,
        choices=TicketStatus.choices,
        default=TicketStatus.NEW,
    )

    source = models.CharField(
        max_length=20,
        choices=TicketSource.choices,
        default=TicketSource.EMAIL,
    )

    priority = models.CharField(
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_tickets",
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
        db_table = "tickets"
        verbose_name = "Ticket"
        verbose_name_plural = "Tickets"
        ordering = ["-created_at"]

    def __str__(self):
        return self.ticket_name