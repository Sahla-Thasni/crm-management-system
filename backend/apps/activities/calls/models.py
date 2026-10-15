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


# -------------------- Call Outcome -------------------- #

class CallOutcome(models.TextChoices):
    CONNECTED = "connected", "Connected"
    NO_ANSWER = "no_answer", "No Answer"
    VOICEMAIL = "voicemail", "Voicemail"
    BUSY = "busy", "Busy"
    FOLLOW_UP = "follow_up", "Follow Up"


# -------------------- Call Duration -------------------- #

class CallDuration(models.IntegerChoices):
    FIVE_MINUTES = 5, "5 min"
    TEN_MINUTES = 10, "10 min"
    FIFTEEN_MINUTES = 15, "15 min"
    THIRTY_MINUTES = 30, "30 min"
    ONE_HOUR = 60, "1 hour"


# -------------------- Call Model -------------------- #

class Call(models.Model):

    note = models.TextField(
        help_text="Call notes or conversation summary.",
    )

    call_outcome = models.CharField(
        max_length=30,
        choices=CallOutcome.choices,
    )

    call_date = models.DateField()

    call_time = models.TimeField()

    duration = models.PositiveIntegerField(
        choices=CallDuration.choices,
        null=True,
        blank=True,
        help_text="Call duration in minutes.",
    )

# -------------------- Phone Call Integration -------------------- #

    class PhoneCallStatus(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        INITIATED = "initiated", "Initiated"
        RINGING = "ringing", "Ringing"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELED = "canceled", "Canceled"

    phone_number = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        help_text="Phone number to call.",
    )

    phone_call_status = models.CharField(
        max_length=20,
        choices=PhoneCallStatus.choices,
        default=PhoneCallStatus.NOT_STARTED,
    )

    twilio_call_sid = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
        help_text="Twilio Call SID.",
    )

    phone_call_started_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    phone_call_ended_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    phone_call_duration = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Actual phone call duration in seconds.",
    )

    module = models.CharField(
        max_length=20,
        choices=Module.choices,
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.PROTECT,
        related_name="calls",
        null=True,
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="calls",
        null=True,
        blank=True,
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.PROTECT,
        related_name="calls",
        null=True,
        blank=True,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.PROTECT,
        related_name="calls",
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_calls",
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
        db_table = "calls"

        verbose_name = "Call"

        verbose_name_plural = "Calls"

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
            f"{related_object or 'Unknown'} | "
            f"{self.get_call_outcome_display()} | "
            f"{self.call_date}"
        )