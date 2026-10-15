from apps.deals.models import DealStage
from apps.leads.models import LeadStatus


class ConversionService:

    @staticmethod
    def calculate(leads, deals):

        # =================================================
        # TOTAL LEADS
        # =================================================

        total_leads = len(leads)

        # =================================================
        # ACTIVE DEALS
        # Closed Won + Closed Lost are not active.
        # =================================================

        active_deals = [
            deal
            for deal in deals
            if deal["deal_stage"] not in (
                DealStage.CLOSED_WON,
                DealStage.CLOSED_LOST,
            )
        ]

        # =================================================
        # CLOSED DEALS
        # Closed Won + Closed Lost
        # =================================================

        closed_deals = [
            deal
            for deal in deals
            if deal["deal_stage"] in (
                DealStage.CLOSED_WON,
                DealStage.CLOSED_LOST,
            )
        ]

        # =================================================
        # CONTACT
        # Every lead except NEW is considered contacted.
        # =================================================

        contacted_leads = [
            lead
            for lead in leads
            if lead["lead_status"] != LeadStatus.NEW
        ]

        contact_percentage = (
            (len(contacted_leads) * 100) / total_leads
            if total_leads
            else 0
        )

        # =================================================
        # QUALIFIED LEADS
        # QUALIFIED + CONVERTED
        # =================================================

        qualified_leads = [
            lead
            for lead in leads
            if lead["lead_status"] in (
                LeadStatus.QUALIFIED,
                LeadStatus.CONVERTED,
            )
        ]

        qualified_percentage = (
            (len(qualified_leads) * 100) / total_leads
            if total_leads
            else 0
        )

        # =================================================
        # PROPOSAL SENT
        # =================================================

        proposal_sent_deals = [
            deal
            for deal in deals
            if deal["deal_stage"] == DealStage.PROPOSAL_SENT
        ]

        proposal_sent_percentage = (
            (len(proposal_sent_deals) * 100) / total_leads
            if total_leads
            else 0
        )

        # =================================================
        # NEGOTIATION
        # =================================================

        negotiation_deals = [
            deal
            for deal in deals
            if deal["deal_stage"] == DealStage.NEGOTIATION
        ]

        negotiation_percentage = (
            (len(negotiation_deals) * 100) / total_leads
            if total_leads
            else 0
        )

        # =================================================
        # CLOSED WON
        # =================================================

        closed_won_deals = [
            deal
            for deal in deals
            if deal["deal_stage"] == DealStage.CLOSED_WON
        ]

        closed_won_percentage = (
            (len(closed_won_deals) * 100) / total_leads
            if total_leads
            else 0
        )

        # =================================================
        # CLOSED LOST
        # =================================================

        closed_lost_deals = [
            deal
            for deal in deals
            if deal["deal_stage"] == DealStage.CLOSED_LOST
        ]

        closed_lost_percentage = (
            (len(closed_lost_deals) * 100) / total_leads
            if total_leads
            else 0
        )

        # =================================================
        # RETURN
        # =================================================

        return {
            "total_leads": total_leads,

            "active_deals": len(active_deals),

            "closed_deals": len(closed_deals),

            "conversion": [
                {
                    "title": "Contact",
                    "percentage": round(
                        contact_percentage,
                        2,
                    ),
                },
                {
                    "title": "Qualified Lead",
                    "percentage": round(
                        qualified_percentage,
                        2,
                    ),
                },
                {
                    "title": "Proposal Sent",
                    "percentage": round(
                        proposal_sent_percentage,
                        2,
                    ),
                },
                {
                    "title": "Negotiation",
                    "percentage": round(
                        negotiation_percentage,
                        2,
                    ),
                },
                {
                    "title": "Closed Won",
                    "percentage": round(
                        closed_won_percentage,
                        2,
                    ),
                },
                {
                    "title": "Closed Lost",
                    "percentage": round(
                        closed_lost_percentage,
                        2,
                    ),
                },
            ],
        }