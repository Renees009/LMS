from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from course.models import Course
from tutor.models import TutorCourse

from .models import StudentProfile, StudentCourseCompletion, StudentCourseEnrollment
from .serializers import (
    StudentCourseCompletionSerializer,
    StudentCourseEnrollmentSerializer,
    StudentProfileSerializer,
)


class StudentMeProfileView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        
        try:
            profile = StudentProfile.objects.get(user=request.user)
            serializer = StudentProfileSerializer(profile, context={"request": request})
            return Response(
                {
                    "id": profile.id,
                    "student_name": profile.student_name,
                    "email": profile.email,
                    "phone": profile.phone,
                    "bio": profile.bio,
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at,
                    "profile_image": serializer.data.get("profile_image"),
                    "profile_image_url": serializer.data.get("profile_image_url"),
                },
                status=status.HTTP_200_OK,
            )
        except StudentProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def put(self, request):
        try:
            profile = StudentProfile.objects.get(user=request.user)

            if "student_name" in request.data:
                profile.student_name = request.data["student_name"]
            if "email" in request.data:
                profile.email = request.data["email"]
           
                request.user.email = request.data["email"]
                request.user.save()
            if "phone" in request.data:
                profile.phone = request.data["phone"]
            if "bio" in request.data:
                profile.bio = request.data["bio"]

            # Handle profile image upload
            profile_image = request.FILES.get("profile_image")
            if profile_image:
                profile.profile_image = profile_image

            profile.save()

            return Response(
                {
                    "id": profile.id,
                    "student_name": profile.student_name,
                    "email": profile.email,
                    "phone": profile.phone,
                    "bio": profile.bio,
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at,
                    # frontend can use these directly
                    "profile_image": profile.profile_image.url if profile.profile_image else "",
                    "profile_image_url": request.build_absolute_uri(profile.profile_image.url) if profile.profile_image else "",
                },
                status=status.HTTP_200_OK,
            )
        except StudentProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class StudentMeEnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentCourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_profile = get_object_or_404(StudentProfile, user=self.request.user)
        return StudentCourseEnrollment.objects.filter(student_profile=student_profile).select_related(
            "course",
            "student_profile",
        )


    def perform_create(self, serializer):

        course_id = self.request.data.get("course") or self.request.data.get("course_id")
        if not course_id:
            raise ValidationError({"course": "course is required"})

        course = get_object_or_404(Course, id=course_id)

       
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user, defaults={
            "student_name": self.request.user.username if getattr(self.request.user, 'is_authenticated', False) else "Student",
        })

        serializer.save(student_profile=profile, course=course)


class StudentMeCompletionListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentCourseCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_profile = get_object_or_404(StudentProfile, user=self.request.user)
        return StudentCourseCompletion.objects.filter(
            student_profile=student_profile
        ).select_related(
            "student_profile",
            "enrollment",
            "enrollment__course",
            "tutor_course",
            "tutor_course__tutor_profile",
        )


    def perform_create(self, serializer):
       
        enrollment_id = self.request.data.get("enrollment") or self.request.data.get("enrollment_id")
        tutor_course_id = self.request.data.get("tutor_course") or self.request.data.get("tutor_course_id")

        if not enrollment_id or not tutor_course_id:
            raise ValidationError({
                "enrollment": "enrollment is required",
                "tutor_course": "tutor_course is required",
            })

        enrollment = get_object_or_404(StudentCourseEnrollment, id=enrollment_id)
        tutor_course = get_object_or_404(TutorCourse, id=tutor_course_id)

        if tutor_course.course_id != enrollment.course_id:
            raise ValidationError("TutorCourse must match the enrollment course")

        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user, defaults={
            "student_name": self.request.user.username if getattr(self.request.user, 'is_authenticated', False) else "Student",
        })

        serializer.save(student_profile=profile, enrollment=enrollment, tutor_course=tutor_course)

