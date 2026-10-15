import csv
import io
from decimal import Decimal, InvalidOperation
from datetime import datetime

from django.db import transaction
from rest_framework import serializers

from apps.deals.models import (
    Deal,
    DealStage,
    Priority,
)
from apps.leads.models import Lead, LeadStatus
from apps.users.models import CustomUser


# =====================================================
# REQUIRED CSV COLUMNS
# =====================================================

REQUIRED_COLUMNS = {
    "deal_name",
    "associated_lead",
    "deal_stage",
    "amount",
    "deal_owner",
    "close_date",
    "priority",
}


# =====================================================
# CLEAN VALUE
# =====================================================

def clean(value):
    if value is None:
        return ""

    return str(value).strip()


# =====================================================
# ASSOCIATED LEAD
# =====================================================

def get_associated_lead(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Associated lead is required."
        )

    lead = None

    # Search by ID
    if value.isdigit():
        lead = Lead.objects.filter(
            id=int(value),
            is_active=True,
        ).first()

    # Search by email
    if lead is None:
        lead = Lead.objects.filter(
            email__iexact=value,
            is_active=True,
        ).first()

    # Search by full name
    if lead is None:
        parts = value.split(maxsplit=1)

        if len(parts) == 2:
            lead = Lead.objects.filter(
                first_name__iexact=parts[0],
                last_name__iexact=parts[1],
                is_active=True,
            ).first()

    if lead is None:
        raise serializers.ValidationError(
            f"Associated lead '{value}' does not exist."
        )

    # Deal creation requires qualified lead
    if lead.lead_status != LeadStatus.QUALIFIED:
        raise serializers.ValidationError(
            f"Lead '{value}' must have status 'Qualified' "
            "before it can be converted into a deal."
        )

    # Prevent duplicate active deal
    if Deal.objects.filter(
        associated_lead=lead,
        is_active=True,
    ).exists():
        raise serializers.ValidationError(
            f"A deal already exists for lead '{value}'."
        )

    return lead


# =====================================================
# DEAL OWNER
# =====================================================

def get_deal_owner(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Deal owner is required."
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

        # Search by full name
        if user is None:
            parts = item.split(maxsplit=1)

            if len(parts) == 2:
                user = CustomUser.objects.filter(
                    first_name__iexact=parts[0],
                    last_name__iexact=parts[1],
                ).first()

        if user is None:
            raise serializers.ValidationError(
                f"Deal owner '{item}' does not exist."
            )

        users.append(user)

    return users


# =====================================================
# DEAL STAGE
# =====================================================

def get_deal_stage(value):

    value = clean(value)

    if not value:
        return DealStage.PROPOSAL_SENT

    valid_stages = [
        choice[0]
        for choice in DealStage.choices
    ]

    for stage in valid_stages:
        if stage.lower() == value.lower():
            return stage

    raise serializers.ValidationError(
        f"Invalid deal stage '{value}'. "
        f"Allowed values: {', '.join(valid_stages)}."
    )


# =====================================================
# PRIORITY
# =====================================================

def get_priority(value):

    value = clean(value)

    if not value:
        return Priority.MEDIUM

    valid_priorities = [
        choice[0]
        for choice in Priority.choices
    ]

    for priority in valid_priorities:
        if priority.lower() == value.lower():
            return priority

    raise serializers.ValidationError(
        f"Invalid priority '{value}'. "
        f"Allowed values: {', '.join(valid_priorities)}."
    )


# =====================================================
# AMOUNT
# =====================================================

def parse_amount(value):

    value = clean(value)

    if not value:
        return Decimal("0.00")

    try:
        amount = Decimal(value)

    except InvalidOperation:
        raise serializers.ValidationError(
            "Amount must be a valid number."
        )

    if amount < 0:
        raise serializers.ValidationError(
            "Amount cannot be negative."
        )

    return amount


# =====================================================
# CLOSE DATE
# =====================================================

def parse_close_date(value):

    value = clean(value)

    if not value:
        raise serializers.ValidationError(
            "Close date is required."
        )

    try:
        return datetime.strptime(
            value,
            "%Y-%m-%d",
        ).date()

    except ValueError:
        raise serializers.ValidationError(
            "Close date must use YYYY-MM-DD format."
        )


# =====================================================
# IMPORT DEALS
# =====================================================

@transaction.atomic
def import_deals_from_csv(
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

    # =================================================
    # VALIDATION
    # =================================================

    deals_to_create = []

    owner_mapping = []

    errors = []

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

            deal_name = clean(
                row.get("deal_name")
            )

            if not deal_name:
                raise serializers.ValidationError(
                    "Deal name is required."
                )

            # -----------------------------------------
            # LEAD
            # -----------------------------------------

            associated_lead = (
                get_associated_lead(
                    row.get(
                        "associated_lead"
                    )
                )
            )

            # -----------------------------------------
            # STAGE
            # -----------------------------------------

            deal_stage = get_deal_stage(
                row.get("deal_stage")
            )

            # -----------------------------------------
            # AMOUNT
            # -----------------------------------------

            amount = parse_amount(
                row.get("amount")
            )

            # -----------------------------------------
            # OWNER
            # -----------------------------------------

            owners = get_deal_owner(
                row.get("deal_owner")
            )

            # -----------------------------------------
            # CLOSE DATE
            # -----------------------------------------

            close_date = parse_close_date(
                row.get("close_date")
            )

            # -----------------------------------------
            # PRIORITY
            # -----------------------------------------

            priority = get_priority(
                row.get("priority")
            )

            # -----------------------------------------
            # STORE
            # -----------------------------------------

            deals_to_create.append(
                {
                    "deal_name": deal_name,
                    "associated_lead": associated_lead,
                    "deal_stage": deal_stage,
                    "amount": amount,
                    "close_date": close_date,
                    "priority": priority,
                }
            )

            owner_mapping.append(
                owners
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
    # CREATE DEALS
    # =================================================

    created_deals = []

    for index, deal_data in enumerate(
        deals_to_create
    ):

        deal = Deal.objects.create(
            deal_name=deal_data[
                "deal_name"
            ],
            associated_lead=deal_data[
                "associated_lead"
            ],
            deal_stage=deal_data[
                "deal_stage"
            ],
            amount=deal_data[
                "amount"
            ],
            close_date=deal_data[
                "close_date"
            ],
            priority=deal_data[
                "priority"
            ],
            created_by=created_by,
        )

        # ManyToMany
        deal.deal_owner.set(
            owner_mapping[index]
        )

        # Convert lead
        lead = deal.associated_lead

        lead.lead_status = LeadStatus.CONVERTED

        lead.save(
            update_fields=[
                "lead_status"
            ]
        )

        created_deals.append(
            deal
        )

    return created_deals