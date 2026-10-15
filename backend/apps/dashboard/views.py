from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.deals.models import Deal
from apps.leads.models import Lead
from apps.users.models import CustomUser

from services.conversion_service import ConversionService
from services.sales_report_service import SalesReportService
from services.team_performance_service import TeamPerformanceService

from .serializers import (
    DashboardDealSerializer,
    DashboardLeadSerializer,
)


class DashboardView(APIView):

    permission_classes = (
        IsAuthenticated,
    )

    def get(self, request):

        # =================================================
        # DASHBOARD PERIOD
        # =================================================

        period = request.query_params.get(
            "period",
            "monthly",
        ).lower()

        # =================================================
        # ALLOWED PERIODS
        # =================================================

        allowed_periods = (
            "monthly",
            "weekly",
            "yearly",
        )

        if period not in allowed_periods:
            period = "monthly"

        # =================================================
        # GET LEADS
        # =================================================

        leads_queryset = Lead.objects.all()

        # Admin → all leads
        # User → only assigned leads
        if request.user.role != "Admin":
            leads_queryset = leads_queryset.filter(
                contact_owner=request.user
            ).distinct()

        leads_serializer = DashboardLeadSerializer(
            leads_queryset,
            many=True,
        )

        leads_data = leads_serializer.data

        # =================================================
        # GET DEALS
        # =================================================

        deals_queryset = (
            Deal.objects
            .prefetch_related("deal_owner")
            .all()
        )

        # Admin can see all deals
        if request.user.role != "Admin":
            deals_queryset = deals_queryset.filter(
                deal_owner=request.user
            ).distinct()

        deals_serializer = DashboardDealSerializer(
            deals_queryset,
            many=True,
        )

        deals_data = deals_serializer.data

        # =================================================
        # GET USERS
        # =================================================

        users_queryset = CustomUser.objects.filter(
            is_active=True,
        )

        # Admin → all active users
        # User → only their own performance
        if request.user.role != "Admin":
            users_queryset = users_queryset.filter(
                id=request.user.id
            )

        # =================================================
        # CONVERSION DATA
        # =================================================

        conversion_data = ConversionService.calculate(
            leads=leads_data,
            deals=deals_data,
        )

        # =================================================
        # SALES REPORT
        # =================================================

        sales_data = SalesReportService.calculate(
            deals=deals_data,
            period=period,
        )

        # =================================================
        # TEAM PERFORMANCE
        # =================================================

        team_performance = TeamPerformanceService.calculate(
            deals=deals_data,
            users=users_queryset,
        )

        # =================================================
        # FINAL RESPONSE
        # =================================================

        return Response(
            {
                **conversion_data,

                "monthly_revenue": (
                    sales_data["monthly_revenue"]
                ),

                "sales_report": (
                    sales_data["sales_report"]
                ),

                "team_performance": team_performance,

                "period": period,
            },
            status=status.HTTP_200_OK,
        )