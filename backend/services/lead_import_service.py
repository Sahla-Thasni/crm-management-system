import csv
import io

from datetime import datetime

from django.db import transaction
from rest_framework import serializers

from apps.leads.models import (
    Lead,
    LeadStatus,
)
from apps.users.models import CustomUser
from apps.products.models import Product
from apps.companies.models import Company


# =====================================================
# REQUIRED CSV COLUMNS
# =====================================================

REQUIRED_COLUMNS = {
    "email",
    "first_name",
    "last_name",
    "phone_number",
    "job_title",
    "contact_owner",
    "lead_status",
    "lead_date",
}


# =====================================================
# CLEAN VALUE
# =====================================================

def clean(value):

    if value is None:
        return ""

    return str(value).strip()


# =====================================================
# CONTACT OWNER
# =====================================================

def get_contact_owners(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Contact owner is required."
        )

    values = [
        item.strip()
        for item in value.replace(";", ",").split(",")
        if item.strip()
    ]

    users = []

    for item in values:

        user = None

        # -------------------------------------------------
        # SEARCH BY USER ID
        # -------------------------------------------------

        if item.isdigit():

            user = CustomUser.objects.filter(
                id=int(item)
            ).first()

        # -------------------------------------------------
        # SEARCH BY EMAIL
        # -------------------------------------------------

        if user is None:

            user = CustomUser.objects.filter(
                email__iexact=item
            ).first()

        # -------------------------------------------------
        # SEARCH BY FULL NAME
        # -------------------------------------------------

        if user is None:

            name_parts = item.split()

            if len(name_parts) >= 2:

                first_name = name_parts[0]

                last_name = " ".join(
                    name_parts[1:]
                )

                user = CustomUser.objects.filter(
                    first_name__iexact=first_name,
                    last_name__iexact=last_name,
                ).first()

        # -------------------------------------------------
        # USER NOT FOUND
        # -------------------------------------------------

        if user is None:

            raise serializers.ValidationError(
                f"Contact owner '{item}' does not exist."
            )

        # -------------------------------------------------
        # AVOID DUPLICATES
        # -------------------------------------------------

        if user not in users:

            users.append(user)

    return users


# =====================================================
# PRODUCT
# =====================================================

def get_products(value):

    value = clean(value)

    if not value:
        return []

    values = [
        item.strip()
        for item in value.replace(";", ",").split(",")
        if item.strip()
    ]

    products = []

    for item in values:

        product = None

        # -------------------------------------------------
        # SEARCH BY PRODUCT ID
        # -------------------------------------------------

        if item.isdigit():

            product = Product.objects.filter(
                id=int(item),
                is_active=True,
            ).first()

        # -------------------------------------------------
        # SEARCH BY PRODUCT NAME
        # -------------------------------------------------

        if product is None:

            product = Product.objects.filter(
                name__iexact=item,
                is_active=True,
            ).first()

        # -------------------------------------------------
        # SEARCH BY SKU
        # -------------------------------------------------

        if product is None:

            product = Product.objects.filter(
                sku__iexact=item,
                is_active=True,
            ).first()

        # -------------------------------------------------
        # PRODUCT NOT FOUND
        # -------------------------------------------------

        if product is None:

            raise serializers.ValidationError(
                f"Product '{item}' does not exist."
            )

        # -------------------------------------------------
        # AVOID DUPLICATES
        # -------------------------------------------------

        if product not in products:

            products.append(product)

    return products


# =====================================================
# COMPANY
# =====================================================

def get_company(value):

    value = clean(value)

    if not value:
        return None

    company = None

    # -------------------------------------------------
    # SEARCH BY COMPANY ID
    # -------------------------------------------------

    if value.isdigit():

        company = Company.objects.filter(
            id=int(value),
            is_active=True,
        ).first()

    # -------------------------------------------------
    # SEARCH BY COMPANY NAME
    # -------------------------------------------------

    if company is None:

        company = Company.objects.filter(
            company_name__iexact=value,
            is_active=True,
        ).first()

    # -------------------------------------------------
    # SEARCH BY DOMAIN
    # -------------------------------------------------

    if company is None:

        company = Company.objects.filter(
            domain_name__iexact=value,
            is_active=True,
        ).first()

    # -------------------------------------------------
    # COMPANY NOT FOUND
    # -------------------------------------------------

    if company is None:

        raise serializers.ValidationError(
            f"Company '{value}' does not exist."
        )

    return company


# =====================================================
# LEAD STATUS
# =====================================================

def get_lead_status(value):

    value = clean(value)

    if not value:

        raise serializers.ValidationError(
            "Lead status is required."
        )

    valid_statuses = {
        choice[0].lower(): choice[0]
        for choice in LeadStatus.choices
    }

    status_value = valid_statuses.get(
        value.lower()
    )

    if status_value is None:

        valid_values = ", ".join(
            choice[0]
            for choice in LeadStatus.choices
        )

        raise serializers.ValidationError(
            f"Invalid lead status '{value}'. "
            f"Allowed values: {valid_values}."
        )

    return status_value


# =====================================================
# LEAD DATE
# =====================================================

def parse_lead_date(value):

    value = clean(value)

    if not value:

        raise serializers.ValidationError(
            "Lead date is required."
        )

    formats = (
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
    )

    for date_format in formats:

        try:

            return datetime.strptime(
                value,
                date_format,
            ).date()

        except ValueError:
            continue

    raise serializers.ValidationError(
        "Lead date must be a valid date. "
        "Use YYYY-MM-DD format."
    )


# =====================================================
# IMPORT LEADS
# =====================================================

@transaction.atomic
def import_leads_from_csv(
    uploaded_file,
    created_by,
):

    raw_data = uploaded_file.read()

    # =================================================
    # DECODE CSV
    # =================================================

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

    # =================================================
    # HEADERS
    # =================================================

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
                "message": (
                    "Required columns are missing."
                ),
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

    # =================================================
    # VALIDATION CONTAINERS
    # =================================================

    leads_to_create = []

    owner_mapping = []

    product_mapping = []

    errors = []

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
            # BASIC FIELDS
            # -----------------------------------------

            email = clean(
                row.get("email")
            ).lower()

            first_name = clean(
                row.get("first_name")
            )

            last_name = clean(
                row.get("last_name")
            )

            phone_number = clean(
                row.get("phone_number")
            )

            job_title = clean(
                row.get("job_title")
            )

            city = clean(
                row.get("city")
            )

            # -----------------------------------------
            # REQUIRED FIELDS
            # -----------------------------------------

            if not email:

                raise serializers.ValidationError(
                    "Email is required."
                )

            if not first_name:

                raise serializers.ValidationError(
                    "First name is required."
                )

            if not last_name:

                raise serializers.ValidationError(
                    "Last name is required."
                )

            if not phone_number:

                raise serializers.ValidationError(
                    "Phone number is required."
                )

            if not job_title:

                raise serializers.ValidationError(
                    "Job title is required."
                )

            # -----------------------------------------
            # DUPLICATE EMAIL IN CSV
            # -----------------------------------------

            if email in emails_in_file:

                raise serializers.ValidationError(
                    f"Duplicate email "
                    f"'{email}' in CSV."
                )

            # -----------------------------------------
            # DUPLICATE EMAIL IN DATABASE
            # -----------------------------------------

            if Lead.objects.filter(
                email__iexact=email
            ).exists():

                raise serializers.ValidationError(
                    f"Lead with email "
                    f"'{email}' already exists."
                )

            # -----------------------------------------
            # CONTACT OWNER
            # -----------------------------------------

            owners = get_contact_owners(
                row.get("contact_owner")
            )

            # -----------------------------------------
            # PRODUCTS
            # -----------------------------------------

            products = get_products(
                row.get("products")
            )

            # -----------------------------------------
            # COMPANY
            # -----------------------------------------

            company = get_company(
                row.get("company")
            )

            # -----------------------------------------
            # STATUS
            # -----------------------------------------

            lead_status = get_lead_status(
                row.get("lead_status")
            )

            # -----------------------------------------
            # DATE
            # -----------------------------------------

            lead_date = parse_lead_date(
                row.get("lead_date")
            )

            # -----------------------------------------
            # STORE LEAD DATA
            # -----------------------------------------

            leads_to_create.append(
                {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone_number": phone_number,
                    "job_title": job_title,
                    "lead_status": lead_status,
                    "company": company,
                    "city": city,
                    "lead_date": lead_date,
                }
            )

            owner_mapping.append(
                owners
            )

            product_mapping.append(
                products
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
    # STOP IF VALIDATION ERRORS
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
    # CREATE LEADS
    # =================================================

    created_leads = []

    for index, lead_data in enumerate(
        leads_to_create
    ):

        lead = Lead.objects.create(
            email=lead_data["email"],
            first_name=lead_data["first_name"],
            last_name=lead_data["last_name"],
            phone_number=lead_data["phone_number"],
            job_title=lead_data["job_title"],
            lead_status=lead_data["lead_status"],
            company=lead_data["company"],
            city=lead_data["city"],
            lead_date=lead_data["lead_date"],
            created_by=created_by,
        )

        # -------------------------------------------------
        # MANY TO MANY - CONTACT OWNERS
        # -------------------------------------------------

        lead.contact_owner.set(
            owner_mapping[index]
        )

        # -------------------------------------------------
        # MANY TO MANY - PRODUCTS
        # -------------------------------------------------

        lead.products.set(
            product_mapping[index]
        )

        created_leads.append(
            lead
        )

    return created_leads