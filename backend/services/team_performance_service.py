from datetime import date
from decimal import Decimal

from apps.deals.models import DealStage


class TeamPerformanceService:

    @staticmethod
    def calculate(deals, users):
        """
        Calculate team performance.

        Parameters:
            deals: list of serialized deal dictionaries
            users: list/queryset of CustomUser objects

        Returns:
            List containing team performance data.
        """

        performance = []

        # =================================================
        # CURRENT AND PREVIOUS MONTH
        # =================================================

        today = date.today()

        current_year = today.year
        current_month = today.month

        if current_month == 1:
            previous_year = current_year - 1
            previous_month = 12
        else:
            previous_year = current_year
            previous_month = current_month - 1

        # =================================================
        # LOOP THROUGH USERS
        # =================================================

        for user in users:

            user_id = user.id

            # -------------------------------------------------
            # EMPLOYEE NAME
            # -------------------------------------------------

            employee_name = (
                f"{user.first_name} {user.last_name}"
            ).strip()

            if not employee_name:
                employee_name = user.email

            # -------------------------------------------------
            # USER DEALS
            # -------------------------------------------------

            user_deals = []

            for deal in deals:

                deal_owners = deal.get(
                    "deal_owner_details",
                    [],
                )

                owner_ids = [
                    owner["id"]
                    for owner in deal_owners
                    if owner.get("id") is not None
                ]

                if user_id in owner_ids:
                    user_deals.append(deal)

            # =================================================
            # ACTIVE DEALS
            # =================================================

            active_deals = [
                deal
                for deal in user_deals
                if deal["deal_stage"] not in (
                    DealStage.CLOSED_WON,
                    DealStage.CLOSED_LOST,
                )
            ]

            # =================================================
            # CLOSED DEALS
            # =================================================

            closed_deals = [
                deal
                for deal in user_deals
                if deal["deal_stage"] in (
                    DealStage.CLOSED_WON,
                    DealStage.CLOSED_LOST,
                )
            ]

            # =================================================
            # CURRENT MONTH REVENUE
            # =================================================

            current_month_revenue = Decimal("0")

            for deal in user_deals:

                if deal["deal_stage"] != DealStage.CLOSED_WON:
                    continue

                close_date = deal.get("close_date")

                if not close_date:
                    continue

                if isinstance(close_date, str):
                    close_date = date.fromisoformat(close_date)

                if (
                    close_date.year == current_year
                    and close_date.month == current_month
                ):
                    current_month_revenue += Decimal(
                        str(deal.get("amount", 0))
                    )

            # =================================================
            # PREVIOUS MONTH REVENUE
            # =================================================

            previous_month_revenue = Decimal("0")

            for deal in user_deals:

                if deal["deal_stage"] != DealStage.CLOSED_WON:
                    continue

                close_date = deal.get("close_date")

                if not close_date:
                    continue

                if isinstance(close_date, str):
                    close_date = date.fromisoformat(close_date)

                if (
                    close_date.year == previous_year
                    and close_date.month == previous_month
                ):
                    previous_month_revenue += Decimal(
                        str(deal.get("amount", 0))
                    )

            # =================================================
            # GROWTH
            # =================================================

            if previous_month_revenue > 0:

                growth = (
                    (
                        current_month_revenue
                        - previous_month_revenue
                    )
                    / previous_month_revenue
                ) * 100

            else:
                growth = Decimal("0")

            # =================================================
            # RESULT
            # =================================================

            performance.append(
                {
                    "id": user_id,
                    "employee": employee_name,
                    "activeDeals": len(active_deals),
                    "closedDeals": len(closed_deals),
                    "revenue": current_month_revenue,
                    "growth": round(growth, 2),
                }
            )

        return performance