from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import EmployerProfile, SeekerProfile, User


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_staff",
            "is_superuser",
            "display_name",
            "date_joined",
        )
        read_only_fields = ("id", "email", "role", "is_staff", "is_superuser", "date_joined", "display_name")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone",
            "role",
        )

    def validate_role(self, value):
        if value not in (User.Role.JOB_SEEKER, User.Role.EMPLOYER):
            raise serializers.ValidationError("Role must be job_seeker or employer.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class JobizzTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class SeekerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SeekerProfile
        fields = (
            "id",
            "user",
            "location",
            "headline",
            "bio",
            "linkedin_url",
            "portfolio_url",
            "skills",
            "education",
            "experience",
            "resume",
            "updated_at",
        )
        read_only_fields = ("id", "user", "updated_at")

    def validate_skills(self, value):
        if isinstance(value, str):
            import json

            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [s.strip() for s in value.split(",") if s.strip()]
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list of strings.")
        return [str(s).strip() for s in value if str(s).strip()]

    def validate_education(self, value):
        if isinstance(value, str):
            import json

            try:
                value = json.loads(value) if value.strip() else []
            except json.JSONDecodeError as e:
                raise serializers.ValidationError(f"Invalid JSON: {e}")
        if not isinstance(value, list):
            raise serializers.ValidationError("Education must be a list.")
        return value

    def validate_experience(self, value):
        if isinstance(value, str):
            import json

            try:
                value = json.loads(value) if value.strip() else []
            except json.JSONDecodeError as e:
                raise serializers.ValidationError(f"Invalid JSON: {e}")
        if not isinstance(value, list):
            raise serializers.ValidationError("Experience must be a list.")
        return value


class EmployerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company_id = serializers.IntegerField(source="company.id", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = EmployerProfile
        fields = (
            "id",
            "user",
            "company",
            "company_id",
            "company_name",
            "job_title",
            "updated_at",
        )
        read_only_fields = ("id", "user", "company_id", "company_name", "updated_at")
        extra_kwargs = {"company": {"write_only": True, "required": False}}


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self, **kwargs):
        email = self.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return None
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return {"uid": uid, "token": token, "user": user}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError("Invalid reset link.")
        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError("Invalid or expired reset token.")
        validate_password(attrs["new_password"], user)
        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
