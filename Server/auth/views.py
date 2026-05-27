from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import SignupSerializer, LoginSerializer
from student.models import StudentProfile
from tutor.models import TutorProfile


def _make_jwt_tokens_for_user(user: User):
 
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def _get_user_role(user: User):

    if hasattr(user, 'studentprofile'):
        return "student"
    elif hasattr(user, 'tutorprofile'):
        return "tutor"
    return None


class SignupView(APIView):
    
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        username = data["username"]
        password = data["password"]
        email = data["email"]
        role = data["role"]

        try:
           
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )

            if role == SignupSerializer.ROLE_STUDENT:
                StudentProfile.objects.create(
                    user=user,
                    student_name=data.get("fullName") or username,
                    email=email,
                    phone=data.get("phone") or "",
                    bio="",
                )
            elif role == SignupSerializer.ROLE_TUTOR:
                TutorProfile.objects.create(
                    user=user,
                    tutor_name=data.get("tutorName") or username,
                    email=email,
                    specialization=data.get("specialization") or "",
                    contact_number=data.get("contactNumber") or "",
                    tutor_bio="",
                )

          
            tokens = _make_jwt_tokens_for_user(user)

            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": role,
                    "access": tokens["access"],
                    "refresh": tokens["refresh"],
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LoginView(APIView):
    
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        try:
           
            user = authenticate(username=username, password=password)

            if user is None:
               
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None

            if user is None:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

           
            role = _get_user_role(user)

       
            tokens = _make_jwt_tokens_for_user(user)

            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": role,
                    "access": tokens["access"],
                    "refresh": tokens["refresh"],
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

