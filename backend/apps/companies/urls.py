from django.urls import path

from .views import (
    CompanyDetailView,
    CompanyListCreateView,
    CompanyTypeDetailView,
    CompanyTypeListCreateView,
    CompanyImportView,
    IndustryDetailView,
    IndustryListCreateView,
)

from apps.activities.notes.views import (
    CompanyNoteDetailView,
    CompanyNoteListCreateView,
)

from apps.activities.calls.views import (
    CompanyCallListCreateView,
    CompanyCallDetailView,
    StartPhoneCallView,
)

from apps.activities.meetings.views import (
    CompanyMeetingListCreateView,
    CompanyMeetingDetailView,
)

from apps.activities.tasks.views import (
    CompanyTaskDetailView,
    CompanyTaskListCreateView,
)

from apps.activities.emails.views import (
    CompanyEmailDetailView,
    CompanyEmailListCreateView
) 

from apps.activities.attachments.views import (
    CompanyAttachmentDetailView,
    CompanyAttachmentListCreateView,
)  




urlpatterns = [

    # -------------------- Industry -------------------- #

    path("industries/",IndustryListCreateView.as_view(),name="industry-list-create",),
    path("industries/<int:pk>/",IndustryDetailView.as_view(),name="industry-detail",),

    # -------------------- Company Type ------------------#

    path("company-types/",CompanyTypeListCreateView.as_view(),name="company-type-list-create",),
    path("company-types/<int:pk>/",CompanyTypeDetailView.as_view(),name="company-type-detail",),

    # -------------------- Company -------------------- #

    path("", CompanyListCreateView.as_view(), name="company-list-create"),
    path("<int:pk>/", CompanyDetailView.as_view(), name="company-detail"),
    # -------------------- Company Import -------------------- #
    path("import/", CompanyImportView.as_view(), name="company-import"),
    
     # -------------------- Company Notes -------------- #
    
    path("<int:company_id>/notes/",CompanyNoteListCreateView.as_view(),name="company-note-list-create",),
    path("<int:company_id>/notes/<int:pk>/",CompanyNoteDetailView.as_view(),name="company-note-detail",),
    
    # -------------------- Company Calls -------------------- #

    path("<int:company_id>/calls/",CompanyCallListCreateView.as_view(),name="company-call-list-create",),
    path("<int:company_id>/calls/<int:pk>/",CompanyCallDetailView.as_view(),name="company-call-detail",),
    path("<int:company_id>/calls/<int:call_id>/start/",StartPhoneCallView.as_view(),name="company-call-start",),
    
    # -------------------- Company Meetings -------------------- #
        
    path("<int:company_id>/meetings/",CompanyMeetingListCreateView.as_view(),name="company-meeting-list-create",),
    path("<int:company_id>/meetings/<int:pk>/",CompanyMeetingDetailView.as_view(),name="company-meeting-detail",),
    
    # -------------------- Company Tasks -------------------- #
    
    path("<int:company_id>/tasks/",CompanyTaskListCreateView.as_view(),name="company-task-list-create",),
    path("<int:company_id>/tasks/<int:pk>/",CompanyTaskDetailView.as_view(),name="company-task-detail",),
    
    # -------------------- Company Emails -------------------- #

    path("<int:company_id>/emails/",CompanyEmailListCreateView.as_view(),name="company-email-list-create",),
    path("<int:company_id>/emails/<int:pk>/",CompanyEmailDetailView.as_view(),name="company-email-detail",),

    # -------------------- Company Attachments -------------------- #
    
    path("<int:company_id>/attachments/",CompanyAttachmentListCreateView.as_view(),name="company-attachment-list-create",),
    path("<int:company_id>/attachments/<int:pk>/",CompanyAttachmentDetailView.as_view(),name="company-attachment-detail",),

]




