from django.db import models

from apps.companies.models import Company
from apps.products.models import Product
from apps.users.models import CustomUser


# -------------------- Lead Status -------------------- #

class LeadStatus(models.TextChoices):
    NEW = "New", "New"
    CONTACTED = "Contacted", "Contacted"
    QUALIFIED = "Qualified", "Qualified"
    CONVERTED = "Converted", "Converted"


# -------------------- Lead Model -------------------- #

class Lead(models.Model):

    email = models.EmailField(
        unique=True,
    )

    first_name = models.CharField(
        max_length=100,
    )

    last_name = models.CharField(
        max_length=100,
    )

    phone_number = models.CharField(
        max_length=20,
    )

    job_title = models.CharField(
        max_length=150,
    )

    contact_owner = models.ManyToManyField(
        CustomUser,
        related_name="assigned_leads",
    )

    lead_status = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW,
    )

    products = models.ManyToManyField(
        Product,
        related_name="leads",
        blank=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        related_name="leads",
        null=True,
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    lead_date = models.DateField()

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_leads",
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
        db_table = "leads"
        verbose_name = "Lead"
        verbose_name_plural = "Leads"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

