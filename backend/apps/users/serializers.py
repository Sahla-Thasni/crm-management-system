from rest_framework import serializers
from .models import CustomUser

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

import secrets
from datetime import timedelta
from django.utils import timezone

from django.contrib.auth.models import Group

#------------------- Register Serializer -------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "last_name",
            "email",
            "password",
            "phone",
            "company_name",
            "industry_type",
            "country",
            "role",
        )

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = CustomUser.objects.create_user(
            password=password,
            **validated_data
        )
        # Automatically assign user to the corresponding Django Group
        group, created = Group.objects.get_or_create(
            name=user.role
        )

        user.groups.add(group)

        return user

#----------------------- Login Serializer ------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "User account is inactive."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),

        }    
#------------------- Forgot Password Serializer ---------------
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError(
                "No account found with this email."
            )

        token = secrets.token_urlsafe(32)

        user.reset_token = token
        user.reset_token_expiry = timezone.now() + timedelta(minutes=30)

        user.save(
            update_fields=[
                "reset_token",
                "reset_token_expiry",
            ]
        )

        self.user = user

        return value    

#--------------- Reset Password Serializer ----------------
class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate(self, attrs):
        token = attrs.get("token")
        password = attrs.get("password")

        try:
            user = CustomUser.objects.get(
                reset_token=token
            )
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid reset token."
            )

        if user.reset_token_expiry < timezone.now():
            raise serializers.ValidationError(
                "Reset token has expired."
            )

        self.user = user
        self.password = password

        return attrs 

#--------------- Profile Serializer --------------------
class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "company_name",
            "industry_type",
            "country",
            "role",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "email",
            "role",
            "created_at",
            "updated_at",
        )        

#--------------- Logout Serializer --------------------        
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        refresh_token = attrs.get("refresh")

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError(
                "Invalid or expired refresh token."
            )

        return attrs

# ---------------- Users List Serializer ----------------

class UserListSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_superuser",
        )