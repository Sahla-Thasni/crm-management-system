from django.conf import settings
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


class PhoneCallService:

    @staticmethod
    def initiate(call, to_phone):

        client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN,
        )

        base_url = settings.TWILIO_BASE_URL.rstrip("/")

        webhook_url = (
            f"{base_url}"
            f"/api/v1/calls/twilio/webhook/"
            f"?call_id={call.id}"
        )

        print()
        print("========== TWILIO CALL ==========")
        print("CRM CALL ID:", call.id)
        print("TO NUMBER:", to_phone)
        print(
            "TWILIO PHONE NUMBER:",
            settings.TWILIO_PHONE_NUMBER,
        )
        print("VOICE URL:")
        print(
            "https://webhooks.twilio.com/"
            "v1/Voice/Template/voice_speech_recognition"
        )
        print("STATUS WEBHOOK:", webhook_url)
        print("=================================")

        if not to_phone:
            raise ValueError(
                "Phone number is required to start the call."
            )

        trial_voice_url = (
            "https://webhooks.twilio.com/"
            "v1/Voice/Template/voice_speech_recognition"
        )

        try:

            twilio_call = client.calls.create(
                to=to_phone,
                from_=settings.TWILIO_PHONE_NUMBER,
                url=trial_voice_url,

                # Send Twilio status updates to Django
                status_callback=webhook_url,
            )

            print()
            print("========== TWILIO CALL CREATED ==========")
            print("TWILIO CALL SID:", twilio_call.sid)
            print("TWILIO CALL STATUS:", twilio_call.status)
            print("=========================================")
            print()

            return twilio_call

        except TwilioRestException as error:

            print()
            print("========== TWILIO ERROR ==========")
            print("STATUS:", getattr(error, "status", None))
            print("CODE:", getattr(error, "code", None))
            print("MESSAGE:", str(error))
            print("MORE INFO:", getattr(error, "uri", None))
            print("==================================")
            print()

            raise

        except Exception as error:

            print()
            print("========== GENERAL TWILIO ERROR ==========")
            print("ERROR:", repr(error))
            print("==========================================")
            print()

            raise