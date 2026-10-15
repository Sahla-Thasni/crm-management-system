from django.urls import path

from .views import (
    TicketDetailView,
    TicketListCreateView,
    TicketImportView,
)

from apps.activities.notes.views import (
    TicketNoteDetailView,
    TicketNoteListCreateView,
)

from apps.activities.calls.views import (
    TicketCallListCreateView,   
    TicketCallDetailView,
    StartPhoneCallView,
)

from apps.activities.meetings.views import (
    TicketMeetingListCreateView,
    TicketMeetingDetailView,
)

from apps.activities.tasks.views import (
    TicketTaskDetailView,
    TicketTaskListCreateView,
)

from apps.activities.emails.views import (
    TicketEmailDetailView,
    TicketEmailListCreateView
)

from apps.activities.attachments.views import (
    TicketAttachmentDetailView,
    TicketAttachmentListCreateView,
)


urlpatterns = [

    # -------------------- Ticket -------------------- #

    path("",TicketListCreateView.as_view(), name="ticket-list-create",),
    path( "import/",TicketImportView.as_view(),name="ticket-import",),
    path("<int:pk>/",TicketDetailView.as_view(),name="ticket-detail",),
    
    # -------------------- Ticket Notes -------------------- #

    path("<int:ticket_id>/notes/",TicketNoteListCreateView.as_view(),name="ticket-note-list-create",),
    path("<int:ticket_id>/notes/<int:pk>/",TicketNoteDetailView.as_view(),name="ticket-note-detail",),
    
    # -------------------- Ticket Calls -------------------- #

    path("<int:ticket_id>/calls/",TicketCallListCreateView.as_view(),name="ticket-call-list-create",),
    path("<int:ticket_id>/calls/<int:pk>/",TicketCallDetailView.as_view(),name="ticket-call-detail",),
    path("<int:ticket_id>/calls/<int:call_id>/start/",StartPhoneCallView.as_view(),name="ticket-call-start",),
    
    # -------------------- Ticket Meetings -------------------- #       
    path("<int:ticket_id>/meetings/",TicketMeetingListCreateView.as_view(),name="ticket-meeting-list-create",),
    path("<int:ticket_id>/meetings/<int:pk>/",TicketMeetingDetailView.as_view(),name="ticket-meeting-detail",),
    
    
    # -------------------- Ticket Tasks -------------------- #
    
    path("<int:ticket_id>/tasks/",TicketTaskListCreateView.as_view(),name="ticket-task-list-create",),
    path("<int:ticket_id>/tasks/<int:pk>/",TicketTaskDetailView.as_view(),name="ticket-task-detail",),

    # -------------------- Ticket Emails -------------------- #

    path("<int:ticket_id>/emails/",TicketEmailListCreateView.as_view(),name="ticket-email-list-create",),
    path("<int:ticket_id>/emails/<int:pk>/",TicketEmailDetailView.as_view(),name="ticket-email-detail",),
    
    # -------------------- Ticket Attachments -------------------- #
    path("<int:ticket_id>/attachments/",TicketAttachmentListCreateView.as_view(),name="ticket-attachment-list-create",),
    path("<int:ticket_id>/attachments/<int:pk>/",TicketAttachmentDetailView.as_view(),name="ticket-attachment-detail",),
    
    

]        

