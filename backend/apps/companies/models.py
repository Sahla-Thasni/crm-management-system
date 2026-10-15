from django.db import models

from apps.users.models import CustomUser


# -------------------- Industry Model -------------------- #

class Industry(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
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
        db_table = "industries"
        verbose_name = "Industry"
        verbose_name_plural = "Industries"
        ordering = ["name"]

    def __str__(self):
        return self.name


# -------------------- Company Type Model -------------------- #

class CompanyType(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
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
        db_table = "company_types"
        verbose_name = "Company Type"
        verbose_name_plural = "Company Types"
        ordering = ["name"]

    def __str__(self):
        return self.name


# -------------------- Company Model -------------------- #

class Company(models.Model):

    company_name = models.CharField(
        max_length=255,
    )

    domain_name = models.CharField(
        max_length=255,
        unique=True,
    )

    email = models.EmailField(
        unique=True,
    )

    phone_number = models.CharField(
        max_length=20,
    )

    company_owner = models.ManyToManyField(
        CustomUser,
        related_name="owned_companies",
        blank=True,
    )

    industry = models.ForeignKey(
        Industry,
        on_delete=models.PROTECT,
        related_name="companies",
    )

    company_type = models.ForeignKey(
        CompanyType,
        on_delete=models.PROTECT,
        related_name="companies",
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    country = models.CharField(
        max_length=100,
        blank=True,
    )

    number_of_employees = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    annual_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_companies",
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
        db_table = "companies"
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ["-created_at"]

    def __str__(self):
        return self.company_name