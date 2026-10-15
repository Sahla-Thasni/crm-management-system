from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response

from .models import Product, ProductCategory
from .serializers import (
    ProductCategorySerializer,
    ProductSerializer,
)


# -------------------- Product Category List/Create -------------------- #

class ProductCategoryListCreateView(ListCreateAPIView):
    serializer_class = ProductCategorySerializer

    queryset = ProductCategory.objects.filter(
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


# -------------------- Product Category Detail -------------------- #

class ProductCategoryDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProductCategorySerializer

    queryset = ProductCategory.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {
                "message": "Product category deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


# -------------------- Product List/Create -------------------- #

class ProductListCreateView(ListCreateAPIView):
    serializer_class = ProductSerializer

    queryset = Product.objects.select_related(
        "category",
    )

    filterset_fields = (
        "category",
        "is_active",
    )

    search_fields = (
        "name",
        "sku",
        "category__name",
    )

    ordering_fields = (
        "name",
        "unit_price",
        "created_at",
    )

    ordering = (
        "name",
    )


# -------------------- Product Detail -------------------- #

class ProductDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer

    queryset = Product.objects.select_related(
        "category",
    )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {
                "message": "Product deleted successfully."
            },
            status=status.HTTP_200_OK,
        )