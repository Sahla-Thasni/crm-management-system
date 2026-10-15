from django.urls import include, path

urlpatterns = [
    path("users/", include("apps.users.urls")),
    path("leads/", include("apps.leads.urls")),
    path("companies/", include("apps.companies.urls")),
    path("deals/", include("apps.deals.urls")),
    path("tickets/", include("apps.tickets.urls")),
    path("dashboard/", include("apps.dashboard.urls")),
    path("products/", include("apps.products.urls")),
    path("global-search/",include("apps.global_search.urls")),
    path("notifications/", include("apps.notifications.urls")),
    # -------------------- Calls / Twilio -------------------- #
    path("calls/", include("apps.activities.calls.urls")),
]