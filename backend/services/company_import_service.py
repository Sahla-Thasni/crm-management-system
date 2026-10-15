import csv
import io
from decimal import Decimal, InvalidOperation

from django.db import transaction
from rest_framework import serializers

from apps.companies.models import (
    Company,
    CompanyType,
    Industry,
)
from apps.users.models import CustomUser


# =====================================================
# REQUIRED CSV COLUMNS
# =====================================================

REQUIRED_COLUMNS = {
    "company_name",
    "domain_name",
    "email",
    "phone_number",
    "company_owner",
    "industry",
    "company_type",
}


# =====================================================
# CLEAN VALUE
# =====================================================

def clean(value):
    if value is None:
        return ""

    return str(value).strip()


# =====================================================
# COMPANY OWNER
# =====================================================

def get_company_owner(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Company owner is required."
        )

    values = [
        item.strip()
        for item in value.replace(";", ",").split(",")
        if item.strip()
    ]

    users = []

    for item in values:

        user = None

        # Search by ID
        if item.isdigit():
            user = CustomUser.objects.filter(
                id=int(item)
            ).first()

        # Search by email
        if user is None:
            user = CustomUser.objects.filter(
                email__iexact=item
            ).first()

        if user is None:
            raise serializers.ValidationError(
                f"Company owner '{item}' does not exist."
            )

        users.append(user)

    return users


# =====================================================
# INDUSTRY
# =====================================================

def get_industry(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Industry is required."
        )

    industry = None

    # Search by ID
    if value.isdigit():
        industry = Industry.objects.filter(
            id=int(value),
            is_active=True,
        ).first()

    # Search by name
    if industry is None:
        industry = Industry.objects.filter(
            name__iexact=value,
            is_active=True,
        ).first()

    if industry is None:
        raise serializers.ValidationError(
            f"Industry '{value}' does not exist."
        )

    return industry


# =====================================================
# COMPANY TYPE
# =====================================================

def get_company_type(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Company type is required."
        )

    company_type = None

    # Search by ID
    if value.isdigit():
        company_type = CompanyType.objects.filter(
            id=int(value),
            is_active=True,
        ).first()

    # Search by name
    if company_type is None:
        company_type = CompanyType.objects.filter(
            name__iexact=value,
            is_active=True,
        ).first()

    if company_type is None:
        raise serializers.ValidationError(
            f"Company type '{value}' does not exist."
        )

    return company_type


# =====================================================
# EMPLOYEES
# =====================================================

def parse_employees(value):

    value = clean(value)

    if not value:
        return None

    try:
        employees = int(value)

    except ValueError:
        raise serializers.ValidationError(
            "Number of employees must be a valid integer."
        )

    if employees < 0:
        raise serializers.ValidationError(
            "Number of employees cannot be negative."
        )

    return employees


# =====================================================
# ANNUAL REVENUE
# =====================================================

def parse_revenue(value):

    value = clean(value)

    if not value:
        return None

    try:
        revenue = Decimal(value)

    except InvalidOperation:
        raise serializers.ValidationError(
            "Annual revenue must be a valid number."
        )

    if revenue < 0:
        raise serializers.ValidationError(
            "Annual revenue cannot be negative."
        )

    return revenue


# =====================================================
# IMPORT COMPANIES
# =====================================================

@transaction.atomic
def import_companies_from_csv(
    uploaded_file,
    created_by,
):

    raw_data = uploaded_file.read()

    # -------------------------------------------------
    # Decode CSV
    # -------------------------------------------------

    try:
        decoded_data = raw_data.decode(
            "utf-8-sig"
        )

    except UnicodeDecodeError:
        decoded_data = raw_data.decode(
            "latin-1"
        )

    csv_file = io.StringIO(
        decoded_data
    )

    reader = csv.DictReader(
        csv_file
    )

    # -------------------------------------------------
    # Headers
    # -------------------------------------------------

    if not reader.fieldnames:

        raise serializers.ValidationError(
            "CSV file does not contain headers."
        )

    headers = {
        clean(header).lower()
        for header in reader.fieldnames
        if header
    }

    missing_columns = (
        REQUIRED_COLUMNS - headers
    )

    if missing_columns:

        raise serializers.ValidationError(
            {
                "message": "Required columns are missing.",
                "missing_columns": sorted(
                    missing_columns
                ),
            }
        )

    rows = list(reader)

    if not rows:

        raise serializers.ValidationError(
            "CSV file does not contain any data."
        )

    # -------------------------------------------------
    # Validation containers
    # -------------------------------------------------

    companies_to_create = []

    owner_mapping = []

    errors = []

    domains_in_file = set()

    emails_in_file = set()

    # =================================================
    # VALIDATE EACH ROW
    # =================================================

    for row_number, row in enumerate(
        rows,
        start=2,
    ):

        try:

            # -----------------------------------------
            # Basic fields
            # -----------------------------------------

            company_name = clean(
                row.get("company_name")
            )

            domain_name = clean(
                row.get("domain_name")
            ).lower()

            email = clean(
                row.get("email")
            ).lower()

            phone_number = clean(
                row.get("phone_number")
            )

            city = clean(
                row.get("city")
            )

            country = clean(
                row.get("country")
            )

            # -----------------------------------------
            # Required fields
            # -----------------------------------------

            if not company_name:
                raise serializers.ValidationError(
                    "Company name is required."
                )

            if not domain_name:
                raise serializers.ValidationError(
                    "Domain name is required."
                )

            if not email:
                raise serializers.ValidationError(
                    "Email is required."
                )

            if not phone_number:
                raise serializers.ValidationError(
                    "Phone number is required."
                )

            # -----------------------------------------
            # Duplicate domain
            # -----------------------------------------

            if domain_name in domains_in_file:

                raise serializers.ValidationError(
                    f"Duplicate domain '{domain_name}' in CSV."
                )

            if Company.objects.filter(
                domain_name__iexact=domain_name
            ).exists():

                raise serializers.ValidationError(
                    f"Company domain '{domain_name}' already exists."
                )

            # -----------------------------------------
            # Duplicate email
            # -----------------------------------------

            if email in emails_in_file:

                raise serializers.ValidationError(
                    f"Duplicate email '{email}' in CSV."
                )

            if Company.objects.filter(
                email__iexact=email
            ).exists():

                raise serializers.ValidationError(
                    f"Company email '{email}' already exists."
                )

            # -----------------------------------------
            # Foreign keys
            # -----------------------------------------

            owners = get_company_owner(
                row.get("company_owner")
            )

            industry = get_industry(
                row.get("industry")
            )

            company_type = get_company_type(
                row.get("company_type")
            )

            # -----------------------------------------
            # Numbers
            # -----------------------------------------

            employees = parse_employees(
                row.get(
                    "number_of_employees"
                )
            )

            annual_revenue = parse_revenue(
                row.get(
                    "annual_revenue"
                )
            )

            # -----------------------------------------
            # Store
            # -----------------------------------------

            companies_to_create.append(
                {
                    "company_name": company_name,
                    "domain_name": domain_name,
                    "email": email,
                    "phone_number": phone_number,
                    "industry": industry,
                    "company_type": company_type,
                    "city": city,
                    "country": country,
                    "number_of_employees": employees,
                    "annual_revenue": annual_revenue,
                }
            )

            owner_mapping.append(
                owners
            )

            domains_in_file.add(
                domain_name
            )

            emails_in_file.add(
                email
            )

        except serializers.ValidationError as exc:

            errors.append(
                {
                    "row": row_number,
                    "error": exc.detail,
                }
            )

    # =================================================
    # STOP IF ERRORS
    # =================================================

    if errors:

        raise serializers.ValidationError(
            {
                "message": (
                    "Import failed. "
                    "Please fix the errors "
                    "and upload the file again."
                ),
                "errors": errors,
            }
        )

    # =================================================
    # CREATE COMPANIES
    # =================================================

    created_companies = []

    for index, company_data in enumerate(
        companies_to_create
    ):

        company = Company.objects.create(
            company_name=company_data[
                "company_name"
            ],

            domain_name=company_data[
                "domain_name"
            ],

            email=company_data[
                "email"
            ],

            phone_number=company_data[
                "phone_number"
            ],

            industry=company_data[
                "industry"
            ],

            company_type=company_data[
                "company_type"
            ],

            city=company_data[
                "city"
            ],

            country=company_data[
                "country"
            ],

            number_of_employees=company_data[
                "number_of_employees"
            ],

            annual_revenue=company_data[
                "annual_revenue"
            ],

            created_by=created_by,
        )

        # ManyToMany
        company.company_owner.set(
            owner_mapping[index]
        )

        created_companies.append(
            company
        )

    return created_companies