from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from course.models import Course
from tutor.models import TutorCourse

from .models import StudentProfile, StudentCourseCompletion, StudentCourseEnrollment
from .serializers import (
    StudentCourseCompletionSerializer,
    StudentCourseEnrollmentSerializer,
)


class StudentMeEnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentCourseEnrollmentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        
        return StudentCourseEnrollment.objects.select_related("course", "student_profile")

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
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return StudentCourseCompletion.objects.select_related(
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

