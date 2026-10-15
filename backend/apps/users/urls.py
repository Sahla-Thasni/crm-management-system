from django.urls import path

from .views import ResetPasswordView, ForgotPasswordView, RegisterView, LoginView, ProfileView, LogoutView, UserListView

urlpatterns = [
    path("register/",RegisterView.as_view(),name="register",),
    path("login/",LoginView.as_view(),name="login",),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/",ForgotPasswordView.as_view(),name="forgot-password",),
    path("reset-password/",ResetPasswordView.as_view(),name="reset-password",),
    path("profile/",ProfileView.as_view(),name="profile",),
    path("list/", UserListView.as_view(), name="user-list"),
]