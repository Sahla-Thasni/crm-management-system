from rest_framework import status
from rest_framework.generics import (
    CreateAPIView ,
    RetrieveUpdateAPIView ,
    ListAPIView,
)
from rest_framework.permissions import (
    AllowAny ,
    IsAuthenticated ,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.views import APIView

from .serializers import ProfileSerializer, ResetPasswordSerializer, RegisterSerializer, LoginSerializer, ForgotPasswordSerializer,  LogoutSerializer, UserListSerializer

#-------------------- Register View -------------------------
class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "User registered successfully.",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": user.role,
                }
            },
            status=status.HTTP_201_CREATED,
        )
#----------------------- Login View ---------------------  
class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        user = data["user"]

        return Response(
            {
                "message": "Login successful.",
                "access": data["access"],
                "refresh": data["refresh"],
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK,
        )  

#---------------- Forgor Password View -----------------------   
class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.user

        reset_link = (
            f"http://localhost:3000/reset-password?token={user.reset_token}"
        )

        subject = "Reset Your CRM Password"

        message = f"""
Hello {user.first_name},

We received a request to reset your password.

Click the link below to reset your password:

{reset_link}

This link will expire in 30 minutes.

If you didn't request this, you can safely ignore this email.

CRM Team
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "Password reset link has been sent to your email."
            },
            status=status.HTTP_200_OK,
        ) 

#----------------- Reset Password View -------------------
class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ResetPasswordSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.user

        user.set_password(serializer.password)

        user.reset_token = None
        user.reset_token_expiry = None

        user.save(
            update_fields=[
                "password",
                "reset_token",
                "reset_token_expiry",
            ]
        )

        return Response(
            {
                "message": "Password has been reset successfully."
            },
            status=status.HTTP_200_OK,
        )  

#---------------- Profile View --------------------
class ProfileView(RetrieveUpdateAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user     

    def patch(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

#---------------- Logout View ------------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        return Response(
            {
                "message": "Logout successful."
            },
            status=status.HTTP_200_OK,
        )

# ---------------- Users List View ----------------

class UserListView(ListAPIView):

    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Admin can see all active users
        if user.role == "Admin":
            return CustomUser.objects.filter(
                is_active=True
            ).order_by("first_name")

        # Normal users cannot access the full users list
        return CustomUser.objects.filter(
            id=user.id,
            is_active=True,
        )