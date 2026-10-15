from datetime import date

from apps.deals.models import DealStage


class SalesReportService:

    @staticmethod
    def calculate(
        deals,
        year=None,
        period="monthly",
    ):
        """
        Calculate sales revenue based on the selected period.

        Supported periods:
            - monthly
            - weekly
            - yearly

        Only Closed Won deals are counted as sales.

        Parameters:
            deals: list of serialized deal dictionaries
            year: report year
            period: monthly, weekly, or yearly

        Returns:
            Dictionary containing:
            - monthly_revenue: current month's revenue
            - sales_report: sales grouped by selected period
        """

        # =================================================
        # REPORT YEAR
        # =================================================

        if year is None:
            year = date.today().year

        # =================================================
        # NORMALIZE PERIOD
        # =================================================

        period = period.lower()

        allowed_periods = (
            "monthly",
            "weekly",
            "yearly",
        )

        if period not in allowed_periods:
            period = "monthly"

        # =================================================
        # CURRENT MONTH REVENUE
        # =================================================

        today = date.today()

        monthly_revenue = 0

        for deal in deals:

            # ---------------------------------------------
            # ONLY CLOSED WON DEALS
            # ---------------------------------------------

            if deal["deal_stage"] != DealStage.CLOSED_WON:
                continue

            # ---------------------------------------------
            # CLOSE DATE
            # ---------------------------------------------

            close_date = deal.get("close_date")

            if not close_date:
                continue

            if isinstance(close_date, str):
                close_date = date.fromisoformat(
                    close_date
                )

            # ---------------------------------------------
            # CURRENT MONTH
            # ---------------------------------------------

            if (
                close_date.year == today.year
                and close_date.month == today.month
            ):
                monthly_revenue += float(
                    deal.get("amount", 0)
                )

        # =================================================
        # MONTHLY REPORT
        # =================================================

        if period == "monthly":

            months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ]

            sales_report = []

            for month_number, month_name in enumerate(
                months,
                start=1,
            ):

                monthly_sales = 0

                for deal in deals:

                    if (
                        deal["deal_stage"]
                        != DealStage.CLOSED_WON
                    ):
                        continue

                    close_date = deal.get("close_date")

                    if not close_date:
                        continue

                    if isinstance(close_date, str):
                        close_date = date.fromisoformat(
                            close_date
                        )

                    if (
                        close_date.year == year
                        and close_date.month
                        == month_number
                    ):
                        monthly_sales += float(
                            deal.get("amount", 0)
                        )

                sales_report.append(
                    {
                        "month": month_name,
                        "sales": monthly_sales,
                    }
                )

        # =================================================
        # WEEKLY REPORT
        # =================================================

        elif period == "weekly":

            # -------------------------------------------------
            # Find number of ISO weeks in selected year.
            # December 28 always belongs to the last ISO week.
            # -------------------------------------------------

            last_week = date(
                year,
                12,
                28,
            ).isocalendar().week

            sales_report = []

            for week_number in range(
                1,
                last_week + 1,
            ):

                weekly_sales = 0

                for deal in deals:

                    if (
                        deal["deal_stage"]
                        != DealStage.CLOSED_WON
                    ):
                        continue

                    close_date = deal.get("close_date")

                    if not close_date:
                        continue

                    if isinstance(close_date, str):
                        close_date = date.fromisoformat(
                            close_date
                        )

                    iso_year, iso_week, _ = (
                        close_date.isocalendar()
                    )

                    if (
                        iso_year == year
                        and iso_week == week_number
                    ):
                        weekly_sales += float(
                            deal.get("amount", 0)
                        )

                sales_report.append(
                    {
                        "month": f"Week {week_number}",
                        "sales": weekly_sales,
                    }
                )

        # =================================================
        # YEARLY REPORT
        # =================================================

        else:

            # -------------------------------------------------
            # Show the selected year and previous 4 years.
            # Example:
            #
            # 2022
            # 2023
            # 2024
            # 2025
            # 2026
            # -------------------------------------------------

            start_year = year - 4

            sales_report = []

            for report_year in range(
                start_year,
                year + 1,
            ):

                yearly_sales = 0

                for deal in deals:

                    if (
                        deal["deal_stage"]
                        != DealStage.CLOSED_WON
                    ):
                        continue

                    close_date = deal.get("close_date")

                    if not close_date:
                        continue

                    if isinstance(close_date, str):
                        close_date = date.fromisoformat(
                            close_date
                        )

                    if close_date.year == report_year:
                        yearly_sales += float(
                            deal.get("amount", 0)
                        )

                sales_report.append(
                    {
                        "month": str(report_year),
                        "sales": yearly_sales,
                    }
                )

        # =================================================
        # RETURN
        # =================================================

        return {
            "monthly_revenue": monthly_revenue,
            "sales_report": sales_report,
        }