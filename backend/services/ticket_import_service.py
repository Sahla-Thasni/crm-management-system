import csv
import io

from contextlib import contextmanager

from django.db import transaction

from rest_framework import serializers

from apps.deals.models import Deal
from apps.tickets.models import (
    Ticket,
    TicketPriority,
    TicketSource,
    TicketStatus,
)
from apps.users.models import CustomUser


# =====================================================
# HELPERS
# =====================================================

def clean_value(value):
    if value is None:
        return ""

    return str(value).strip()


def split_multiple_values(value):
    """
    Supports values such as:

    admin@gmail.com,John Manager
    """

    if not value:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


# =====================================================
# DEAL LOOKUP
# =====================================================

def get_deal(value):
    value = clean_value(value)

    if not value:
        raise serializers.ValidationError(
            "Associated deal is required."
        )

    # -------------------------------------------------
    # First try ID
    # -------------------------------------------------

    if value.isdigit():
        deal = Deal.objects.filter(
            id=int(value)
        ).first()

        if deal:
            return deal

    # -------------------------------------------------
    # Then try deal name
    # -------------------------------------------------

    deal = Deal.objects.filter(
        deal_name__iexact=value
    ).first()

    if not deal:
        raise serializers.ValidationError(
            f"Associated deal '{value}' does not exist."
        )

    return deal


# =====================================================
# USER LOOKUP
# =====================================================

def get_user(value):
    value = clean_value(value)

    if not value:
        return None

    # -------------------------------------------------
    # Email
    # -------------------------------------------------

    if "@" in value:
        user = CustomUser.objects.filter(
            email__iexact=value
        ).first()

        if user:
            return user

    # -------------------------------------------------
    # Full name
    # -------------------------------------------------

    users = CustomUser.objects.filter(
        first_name__iexact=value
    )

    if users.count() == 1:
        return users.first()

    user = CustomUser.objects.filter(
        last_name__iexact=value
    ).first()

    if user:
        return user

    # -------------------------------------------------
    # Full name
    # -------------------------------------------------

    name_parts = value.split()

    if len(name_parts) >= 2:
        first_name = name_parts[0]
        last_name = " ".join(name_parts[1:])

        user = CustomUser.objects.filter(
            first_name__iexact=first_name,
            last_name__iexact=last_name,
        ).first()

        if user:
            return user

    raise serializers.ValidationError(
        f"Ticket owner '{value}' does not exist."
    )


# =====================================================
# CHOICE VALIDATION
# =====================================================

def validate_choice(value, choices, field_name):
    value = clean_value(value)

    allowed_values = [
        choice[0]
        for choice in choices
    ]

    # Case-insensitive match
    for allowed in allowed_values:
        if allowed.lower() == value.lower():
            return allowed

    raise serializers.ValidationError(
        f"Invalid {field_name} '{value}'. "
        f"Allowed values: {', '.join(allowed_values)}."
    )


# =====================================================
# IMPORT SERVICE
# =====================================================

@transaction.atomic
def import_tickets_from_csv(
    uploaded_file,
    created_by,
):

    # =================================================
    # READ FILE
    # =================================================

    try:
        decoded_file = uploaded_file.read().decode(
            "utf-8-sig"
        )
    except UnicodeDecodeError:
        raise serializers.ValidationError(
            {
                "message": (
                    "Import failed. Please fix the errors "
                    "and upload the file again."
                ),
                "errors": [
                    {
                        "row": "1",
                        "error": [
                            "CSV file must be UTF-8 encoded."
                        ],
                    }
                ],
            }
        )

    reader = csv.DictReader(
        io.StringIO(decoded_file)
    )

    # =================================================
    # REQUIRED COLUMNS
    # =================================================

    required_columns = [
        "ticket_name",
        "description",
        "associated_deal",
        "ticket_owner",
        "ticket_status",
        "source",
        "priority",
    ]

    if not reader.fieldnames:
        raise serializers.ValidationError(
            {
                "message": "CSV file is empty.",
            }
        )

    actual_columns = [
        column.strip()
        for column in reader.fieldnames
        if column
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in actual_columns
    ]

    if missing_columns:
        raise serializers.ValidationError(
            {
                "message": (
                    "Import failed. Please fix the errors "
                    "and upload the file again."
                ),
                "errors": [
                    {
                        "row": "header",
                        "error": [
                            (
                                "Missing required columns: "
                                + ", ".join(missing_columns)
                            )
                        ],
                    }
                ],
            }
        )

    # =================================================
    # PROCESS ROWS
    # =================================================

    errors = []
    valid_rows = []

    for row_number, row in enumerate(
        reader,
        start=2,
    ):

        try:

            # -----------------------------------------
            # CLEAN VALUES
            # -----------------------------------------

            ticket_name = clean_value(
                row.get("ticket_name")
            )

            description = clean_value(
                row.get("description")
            )

            associated_deal_value = clean_value(
                row.get("associated_deal")
            )

            ticket_owner_value = clean_value(
                row.get("ticket_owner")
            )

            ticket_status_value = clean_value(
                row.get("ticket_status")
            )

            source_value = clean_value(
                row.get("source")
            )

            priority_value = clean_value(
                row.get("priority")
            )

            # -----------------------------------------
            # REQUIRED TICKET NAME
            # -----------------------------------------

            if not ticket_name:
                raise serializers.ValidationError(
                    "Ticket name is required."
                )

            # -----------------------------------------
            # DEAL
            # -----------------------------------------

            deal = get_deal(
                associated_deal_value
            )

            # -----------------------------------------
            # TICKET OWNERS
            # -----------------------------------------

            owner_values = split_multiple_values(
                ticket_owner_value
            )

            if not owner_values:
                raise serializers.ValidationError(
                    "At least one ticket owner is required."
                )

            owners = []

            for owner_value in owner_values:
                owner = get_user(
                    owner_value
                )

                if owner:
                    owners.append(owner)

            if not owners:
                raise serializers.ValidationError(
                    "At least one valid ticket owner is required."
                )

            # -----------------------------------------
            # STATUS
            # -----------------------------------------

            ticket_status = validate_choice(
                ticket_status_value,
                TicketStatus.choices,
                "ticket status",
            )

            # -----------------------------------------
            # SOURCE
            # -----------------------------------------

            source = validate_choice(
                source_value,
                TicketSource.choices,
                "source",
            )

            # -----------------------------------------
            # PRIORITY
            # -----------------------------------------

            priority = validate_choice(
                priority_value,
                TicketPriority.choices,
                "priority",
            )

            # -----------------------------------------
            # STORE VALID ROW
            # -----------------------------------------

            valid_rows.append(
                {
                    "ticket_name": ticket_name,
                    "description": description,
                    "associated_deal": deal,
                    "ticket_owner": owners,
                    "ticket_status": ticket_status,
                    "source": source,
                    "priority": priority,
                }
            )

        except serializers.ValidationError as error:

            detail = error.detail

            if isinstance(detail, list):
                error_messages = [
                    str(message)
                    for message in detail
                ]
            else:
                error_messages = [
                    str(detail)
                ]

            errors.append(
                {
                    "row": str(row_number),
                    "error": error_messages,
                }
            )

        except Exception as error:

            errors.append(
                {
                    "row": str(row_number),
                    "error": [
                        str(error)
                    ],
                }
            )

    # =================================================
    # STOP IF ANY ERROR
    # =================================================

    if errors:
        raise serializers.ValidationError(
            {
                "message": (
                    "Import failed. Please fix the errors "
                    "and upload the file again."
                ),
                "errors": errors,
            }
        )

    # =================================================
    # CREATE TICKETS
    # =================================================

    imported_count = 0

    for data in valid_rows:

        owners = data.pop(
            "ticket_owner"
        )

        ticket = Ticket.objects.create(
            created_by=created_by,
            **data,
        )

        ticket.ticket_owner.set(
            owners
        )

        imported_count += 1

    # =================================================
    # RETURN RESULT
    # =================================================

    return imported_count