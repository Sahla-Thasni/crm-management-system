from django.urls import path

from .views import (
    LeadDetailView,
    LeadListCreateView,
    LeadImportView,
)

from apps.activities.notes.views import (
    LeadNoteDetailView,
    LeadNoteListCreateView,
)

from apps.activities.calls.views import (
    LeadCallListCreateView,
    LeadCallDetailView,
    StartPhoneCallView,
)

from apps.activities.meetings.views import (
    LeadMeetingListCreateView,
    LeadMeetingDetailView,
)

from apps.activities.tasks.views import (
    LeadTaskDetailView,
    LeadTaskListCreateView,
)

from apps.activities.emails.views import (
    LeadEmailDetailView,
    LeadEmailListCreateView,
)

from apps.activities.attachments.views import (
    LeadAttachmentDetailView,
    LeadAttachmentListCreateView,
)


urlpatterns = [

    # -------------------- Lead -------------------- #

    path("",LeadListCreateView.as_view(),name="lead-list-create",),
    path("import/",LeadImportView.as_view(),name="lead-import",),
    path("<int:pk>/",LeadDetailView.as_view(),name="lead-detail",),
    

   # -------------------- Lead Notes ----------------#

    path("<int:lead_id>/notes/",LeadNoteListCreateView.as_view(),name="lead-note-list-create",),
    path("<int:lead_id>/notes/<int:pk>/",LeadNoteDetailView.as_view(),name="lead-note-detail",),
    
    # -------------------- Lead Calls -------------------- #

    path("<int:lead_id>/calls/",LeadCallListCreateView.as_view(),name="lead-call-list-create",),
    path("<int:lead_id>/calls/<int:pk>/",LeadCallDetailView.as_view(),name="lead-call-detail",),
    path("<int:lead_id>/calls/<int:call_id>/start/",StartPhoneCallView.as_view(),name="lead-call-start",),
    
     # -------------------- Lead Meetings -------------------- #
    
    path("<int:lead_id>/meetings/",LeadMeetingListCreateView.as_view(),name="lead-meeting-list-create",),
    path("<int:lead_id>/meetings/<int:pk>/",LeadMeetingDetailView.as_view(),name="lead-meeting-detail",),

    # -------------------- Lead Tasks -------------------- #

    path("<int:lead_id>/tasks/",LeadTaskListCreateView.as_view(),name="lead-task-list-create",),
    path("<int:lead_id>/tasks/<int:pk>/",LeadTaskDetailView.as_view(),name="lead-task-detail",),
    
    # -------------------- Lead Emails -------------------- #

    path("<int:lead_id>/emails/",LeadEmailListCreateView.as_view(),name="lead-email-list-create",),
    path("<int:lead_id>/emails/<int:pk>/",LeadEmailDetailView.as_view(),name="lead-email-detail",),
    
    # -------------------- Lead Attachments -------------------- #
    
    path("<int:lead_id>/attachments/",LeadAttachmentListCreateView.as_view(),name="lead-attachment-list-create",),
    path("<int:lead_id>/attachments/<int:pk>/",LeadAttachmentDetailView.as_view(),name="lead-attachment-detail",),


    
]




