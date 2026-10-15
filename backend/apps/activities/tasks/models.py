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


# -------------------- Task Type -------------------- #

class TaskType(models.TextChoices):
    TO_DO = "to_do", "To Do"
    FOLLOW_UP = "follow_up", "Follow Up"
    REMINDER = "reminder", "Reminder"


# -------------------- Priority -------------------- #

class Priority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"


# -------------------- Task Model -------------------- #

class Task(models.Model):

    title = models.CharField(
        max_length=255,
    )

    note = models.TextField(
        blank=True,
        help_text="Task description or additional notes.",
    )

    due_date = models.DateField()

    due_time = models.TimeField()

    task_type = models.CharField(
        max_length=20,
        choices=TaskType.choices,
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    assigned_to = models.ManyToManyField(
        CustomUser,
        related_name="assigned_tasks",
        blank=True,
    )

    module = models.CharField(
        max_length=20,
        choices=Module.choices,
    )

    lead = models.ForeignKey(
        Lead,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )

    deal = models.ForeignKey(
        Deal,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_tasks",
    )

    is_active = models.BooleanField(
        default=True,
    )

    completed = models.BooleanField(
    default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        db_table = "tasks"

        verbose_name = "Task"

        verbose_name_plural = "Tasks"

        ordering = (
            "-created_at",
        )

        indexes = [
            models.Index(
                fields=["module"],
            ),
            models.Index(
                fields=["due_date"],
            ),
            models.Index(
                fields=["priority"],
            ),
            models.Index(
                fields=["task_type"],
            ),
            models.Index(
                fields=["is_active"],
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
                name="task_exactly_one_related_object",
            ),
        ]

    # -------------------- String Representation -------------------- #

    def __str__(self):

        related_object = (
            self.lead
            or self.company
            or self.deal
            or self.ticket
        )

        return (
            f"{self.title} "
            f"({self.get_task_type_display()}) - "
            f"{related_object or 'No Association'}"
        )