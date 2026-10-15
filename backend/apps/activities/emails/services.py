from django.core.mail import EmailMessage
from django.utils import timezone

from .models import Email, EmailStatus


# -------------------- Send Email -------------------- #

def send_email(email):

    email.status = EmailStatus.SENDING

    email.save(
        update_fields=(
            "status",
            "updated_at",
        ),
    )

    try:

        message = EmailMessage(
            subject=email.subject,
            body=email.body,
            to=email.recipients,
            cc=email.cc,
            bcc=email.bcc,
        )

        # -------------------- Attachments -------------------- #

        for attachment in email.attachments.all():

            message.attach_file(
                attachment.file.path,
            )

        # -------------------- Send Email -------------------- #

        message.send(
            fail_silently=False,
        )

        # -------------------- Success -------------------- #

        email.status = EmailStatus.SENT

        email.sent_at = timezone.now()

        email.save(
            update_fields=(
                "status",
                "sent_at",
                "updated_at",
            ),
        )

        return True

    except Exception:

        # -------------------- Failed -------------------- #

        email.status = EmailStatus.FAILED

        email.save(
            update_fields=(
                "status",
                "updated_at",
            ),
        )

        return False