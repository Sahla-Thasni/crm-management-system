from django.urls import path

from apps.products.views import (
    ProductCategoryDetailView,
    ProductCategoryListCreateView,
    ProductDetailView,
    ProductListCreateView,
)

urlpatterns = [
    # Product Category URLs
    path(
        "categories/",
        ProductCategoryListCreateView.as_view(),
        name="product-category-list",
    ),
    path(
        "categories/<int:pk>/",
        ProductCategoryDetailView.as_view(),
        name="product-category-detail",
    ),

    # Product URLs
    path(
        "",
        ProductListCreateView.as_view(),
        name="product-list",
    ),
    path(
        "<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
]