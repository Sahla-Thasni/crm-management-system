from rest_framework import status, serializers
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response

from rest_framework.permissions import (
    IsAuthenticated,
    DjangoModelPermissions,
)

from services.notification_service import NotificationService

from .models import (
    Company,
    CompanyType,
    Industry,
)

from .serializers import (
    CompanySerializer,
    CompanyTypeSerializer,
    IndustrySerializer,
    CompanyImportSerializer,
)

from rest_framework.views import APIView

from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)
from services.company_import_service import (
    import_companies_from_csv,
)

# -------------------- Industry List/Create -------------------- #

class IndustryListCreateView(ListCreateAPIView):
    serializer_class = IndustrySerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    queryset = Industry.objects.filter(
        is_active=True,
    ).order_by("name")

    search_fields = (
        "name",
    )

    ordering_fields = (
        "name",
        "created_at",
    )

    ordering = (
        "name",
    )


# -------------------- Industry Detail -------------------- #

class IndustryDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = IndustrySerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    queryset = Industry.objects.all()

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()

        return Response(
            {
                "message": "Industry deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Company Type List/Create -------------------- #

class CompanyTypeListCreateView(ListCreateAPIView):
    serializer_class = CompanyTypeSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    queryset = CompanyType.objects.filter(
        is_active=True,
    ).order_by("name")

    search_fields = (
        "name",
    )

    ordering_fields = (
        "name",
        "created_at",
    )

    ordering = (
        "name",
    )


# -------------------- Company Type Detail -------------------- #

class CompanyTypeDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CompanyTypeSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    queryset = CompanyType.objects.all()

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()

        return Response(
            {
                "message": "Company type deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Company List/Create -------------------- #

class CompanyListCreateView(ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    filterset_fields = (
        "industry",
        "company_type",
        "company_owner",
        "country",
        "city",
        "is_active",
    )

    search_fields = (
        "company_name",
        "phone_number",
        "city",
    )

    ordering_fields = (
        "company_name",
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Company.objects.select_related(
                "industry",
                "company_type",
                "created_by",
            )
            .prefetch_related(
                "company_owner",
            )
        )

        # Admin can see all companies
        if user.role == "Admin":
            return queryset

        # Normal user can see only companies assigned to them
        return queryset.filter(
            company_owner=user
        ).distinct()

    def perform_create(self, serializer):

        company = serializer.save(
            created_by=self.request.user,
        )

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"created a new company: "
                f"{company.company_name}"
            ),
        )


# -------------------- Company Detail -------------------- #

class CompanyDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer

    permission_classes = [
        IsAuthenticated,
        DjangoModelPermissions,
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Company.objects.select_related(
                "industry",
                "company_type",
                "created_by",
            )
            .prefetch_related(
                "company_owner",
            )
        )

        # Admin can access every company
        if user.role == "Admin":
            return queryset

        # Normal user can access only their assigned companies
        return queryset.filter(
            company_owner=user
        ).distinct()
    
    def perform_update(self, serializer):

        company = serializer.save()

        NotificationService.create(
            user=self.request.user,
            message=(
                f"{self.request.user.get_full_name()} "
                f"updated company: "
                f"{company.company_name}"
            ),
        )

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()

        return Response(
            {
                "message": "Company deleted successfully."
            },
            status=status.HTTP_200_OK,
        )
    # =====================================================
# COMPANY IMPORT
# =====================================================
class CompanyImportView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    queryset = Company.objects.all()

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {
                    "detail": "CSV file is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            companies = import_companies_from_csv(
                uploaded_file=file,
                created_by=request.user,
            )

            return Response(
                {
                    "message": (
                        "Companies imported successfully."
                    ),
                    "imported_count": len(companies),
                },
                status=status.HTTP_201_CREATED,
            )

        except serializers.ValidationError as error:

            return Response(
                error.detail,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as error:

            print(
                "IMPORT ERROR:",
                repr(error)
            )

            return Response(
                {
                    "detail": str(error)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )