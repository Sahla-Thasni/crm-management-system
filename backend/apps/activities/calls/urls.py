from django.urls import path

from .views import (
    TwilioVoiceView,
    TwilioWebhookView,
)

urlpatterns = [
    

    # Twilio → Django → Customer
    path(
        "twilio/voice/",
        TwilioVoiceView.as_view(),
        name="twilio-voice",
    ),

    # Twilio → Django status updates
    path(
        "twilio/webhook/",
        TwilioWebhookView.as_view(),
        name="twilio-webhook",
    ),
]