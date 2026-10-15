from django.urls import path

from .views import (
    DealDetailView,
    DealListCreateView,
    DealImportView,
)

from apps.activities.notes.views import (
    DealNoteDetailView,
    DealNoteListCreateView,
)

from apps.activities.calls.views import (
    DealCallListCreateView,
    DealCallDetailView,
    StartPhoneCallView,
)

from apps.activities.meetings.views import (
    DealMeetingListCreateView,
    DealMeetingDetailView,
)

from apps.activities.tasks.views import (
    DealTaskDetailView, 
    DealTaskListCreateView,
)

from apps.activities.emails.views import (
    DealEmailDetailView,
    DealEmailListCreateView,
)  

from apps.activities.attachments.views import (
    DealAttachmentDetailView,
    DealAttachmentListCreateView,
) 


urlpatterns = [
    
    # -------------------- Deal -------------------------------- # 
   
    path("",DealListCreateView.as_view(),name="deal-list-create",),
    path("import/",DealImportView.as_view(),name="deal-import",),
    path("<int:pk>/",DealDetailView.as_view(),name="deal-detail",),
    
    # -------------------- Deal Notes -------------------------------- # 

    path("<int:deal_id>/notes/",DealNoteListCreateView.as_view(),name="deal-note-list-create",),
    path("<int:deal_id>/notes/<int:pk>/",DealNoteDetailView.as_view(),name="deal-note-detail",),
    
    # -------------------- Deal Calls -------------------- #

    path("<int:deal_id>/calls/",DealCallListCreateView.as_view(),name="deal-call-list-create",),
    path("<int:deal_id>/calls/<int:pk>/",DealCallDetailView.as_view(),name="deal-call-detail",),
    path("<int:deal_id>/calls/<int:call_id>/start/",StartPhoneCallView.as_view(),name="deal-call-start",),
    
    # -------------------- Deal Meetings -------------------- #

    path("<int:deal_id>/meetings/",DealMeetingListCreateView.as_view(),name="deal-meeting-list-create",),
    path("<int:deal_id>/meetings/<int:pk>/",DealMeetingDetailView.as_view(),name="deal-meeting-detail",),
    
    # -------------------- Deal Tasks -------------------- #

    path("<int:deal_id>/tasks/",DealTaskListCreateView.as_view(),name="deal-task-list-create",),
    path("<int:deal_id>/tasks/<int:pk>/",DealTaskDetailView.as_view(),name="deal-task-detail",),
    
    # -------------------- Deal Emails -------------------- #
    
    path("<int:deal_id>/emails/",DealEmailListCreateView.as_view(),name="deal-email-list-create",),
    path("<int:deal_id>/emails/<int:pk>/",DealEmailDetailView.as_view(),name="deal-email-detail",),
    
    # -------------------- Deal Attachments -------------------- #
    path("<int:deal_id>/attachments/",DealAttachmentListCreateView.as_view(),name="deal-attachment-list-create",),
    path("<int:deal_id>/attachments/<int:pk>/",DealAttachmentDetailView.as_view(),name="deal-attachment-detail",),
    
]   

