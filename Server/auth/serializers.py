from django.contrib.auth.models import User
from rest_framework import serializers


class SignupSerializer(serializers.Serializer):
    ROLE_STUDENT = "student"
    ROLE_TUTOR = "tutor"

    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
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

