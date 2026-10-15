from django.db.models import Q

from apps.leads.models import Lead
from apps.companies.models import Company
from apps.deals.models import Deal
from apps.tickets.models import Ticket


def global_search(search_query):

    results = []

    # =================================================
    # LEADS
    # =================================================

    lead_queryset = Lead.objects.select_related("company")

    if search_query:
        lead_queryset = lead_queryset.filter(
            Q(first_name__icontains=search_query)
            | Q(last_name__icontains=search_query)
            | Q(email__icontains=search_query)
            | Q(phone_number__icontains=search_query)
            | Q(job_title__icontains=search_query)
            | Q(city__icontains=search_query)
        )

    for lead in lead_queryset:
        results.append({
            "type": "lead",
            "id": lead.id,
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "status": lead.lead_status,
            "phone_number": lead.phone_number,
            "company": (
                lead.company.company_name
                if lead.company
                else None
            ),
        })

    # =================================================
    # COMPANIES
    # =================================================

    company_queryset = Company.objects.all()

    if search_query:
        company_queryset = company_queryset.filter(
            Q(company_name__icontains=search_query)
            | Q(email__icontains=search_query)
            | Q(phone_number__icontains=search_query)
            | Q(city__icontains=search_query)
        )

    for company in company_queryset:
        results.append({
            "type": "company",
            "id": company.id,
            "company_name": company.company_name,
            "phone_number": company.phone_number,
            "city": company.city,
        })

    # =================================================
    # DEALS
    # =================================================

    deal_queryset = Deal.objects.all()

    if search_query:
        deal_queryset = deal_queryset.filter(
            Q(deal_name__icontains=search_query)
        )

    for deal in deal_queryset:
        results.append({
            "type": "deal",
            "id": deal.id,
            "deal_name": deal.deal_name,
            "status": deal.deal_stage,
            "amount": deal.amount,
        })

    # =================================================
    # TICKETS
    # =================================================

    ticket_queryset = Ticket.objects.all()

    if search_query:
        ticket_queryset = ticket_queryset.filter(
            Q(ticket_name__icontains=search_query)
        )

    for ticket in ticket_queryset:
        results.append({
            "type": "ticket",
            "id": ticket.id,
            "ticket_name": ticket.ticket_name,
            "status": ticket.ticket_status,
            "priority": ticket.priority,
        })

    return results