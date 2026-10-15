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


# -------------------- Reminder -------------------- #

class Reminder(models.TextChoices):
    NONE = "none", "None"
    FIVE_MINUTES = "5_minutes", "5 Minutes Before"
    FIFTEEN_MINUTES = "15_minutes", "15 Minutes Before"
    THIRTY_MINUTES = "30_minutes", "30 Minutes Before"
    ONE_HOUR = "1_hour", "1 Hour Before"
    ONE_DAY = "1_day", "1 Day Before"


# -------------------- Meeting Model -------------------- #

class Meeting(models.Model):

    title = models.CharField(
        max_length=255,
    )

    note = models.TextField(
        help_text="Meeting notes or agenda.",
    )

    start_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    attendees = models.ManyToManyField(
        CustomUser,
        related_name="meeting_attendees",
        blank=True,
    )
    
    location = models.CharField(
        max_length=255,
        blank=True,
    )

    reminder = models.CharField(
        max_length=20,
        choices=Reminder.choices,
        default=Reminder.NONE,
    )

    module = models.CharField(
        max_length=20,
        choices=Module.choices,
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        related_name="meetings",
        null=True,
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        related_name="meetings",
        null=True,
        blank=True,
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.SET_NULL,
        related_name="meetings",
        null=True,
        blank=True,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        related_name="meetings",
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_meetings",
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
        db_table = "meetings"

        verbose_name = "Meeting"

        verbose_name_plural = "Meetings"

        ordering = (
            "-created_at",
        )

    def __str__(self):

        related_object = (
            self.lead
            or self.company
            or self.deal
            or self.ticket
        )

        return (
            f"{self.title} | "
            f"{related_object or 'No Association'} | "
            f"{self.start_date}"
        )