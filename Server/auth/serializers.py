from django.contrib.auth.models import User
from rest_framework import serializers


class SignupSerializer(serializers.Serializer):
    ROLE_STUDENT = "student"
    ROLE_TUTOR = "tutor"

    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=[(ROLE_STUDENT, ROLE_STUDENT), (ROLE_TUTOR, ROLE_TUTOR)])

    fullName = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)


    tutorName = serializers.CharField(required=False, allow_blank=True)
    specialization = serializers.CharField(required=False, allow_blank=True)
    contactNumber = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_password(self, value):

        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")

        has_upper = any(c.isupper() for c in value)
        has_lower = any(c.islower() for c in value)
        has_digit = any(c.isdigit() for c in value)
        has_special = any((not c.isalnum()) for c in value)

        if not (has_upper and has_lower and has_digit and has_special):
            raise serializers.ValidationError(
                "Password must include at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character"
            )

        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value



class LoginSerializer(serializers.Serializer):
   
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise serializers.ValidationError("Username and password are required")

        return data


class TutorPasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True, min_length=1)
    new_password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True, min_length=1)

    def validate(self, data):
        if data.get("new_password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Password mismatch"})
        return data



class StudentProfileSerializer(serializers.Serializer):
    
    student_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)


class TutorProfileSerializer(serializers.Serializer):
   
    tutor_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    specialization = serializers.CharField(required=False, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    tutor_bio = serializers.CharField(required=False, allow_blank=True)

