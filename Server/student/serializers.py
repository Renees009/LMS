from rest_framework import serializers

from course.models import Course
from tutor.models import TutorCourse

from .models import StudentProfile, StudentCourseEnrollment, StudentCourseCompletion


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "student_name",
        ]


class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_category = serializers.CharField(source="course.category", read_only=True)
    course_duration = serializers.IntegerField(source="course.duration", read_only=True)
    course_level = serializers.CharField(source="course.level", read_only=True)
    course_description = serializers.CharField(source="course.description", read_only=True)

    class Meta:
        model = StudentCourseEnrollment
        fields = [
            "id",
            "student_profile",
            "course",
            "course_title",
            "course_category",
            "course_duration",
            "course_level",
            "course_description",
            "status",
            "enrolled_at",
        ]


class StudentCourseCompletionSerializer(serializers.ModelSerializer):
    
    student_name = serializers.CharField(source="student_profile.student_name", read_only=True)

    course_title = serializers.CharField(source="enrollment.course.title", read_only=True)
    course_category = serializers.CharField(source="enrollment.course.category", read_only=True)
    course_duration = serializers.IntegerField(source="enrollment.course.duration", read_only=True)
    course_level = serializers.CharField(source="enrollment.course.level", read_only=True)
    course_description = serializers.CharField(source="enrollment.course.description", read_only=True)

    tutor_details = serializers.CharField(source="tutor_course.tutor_profile.tutor_name", read_only=True)
    tutor_id = serializers.IntegerField(source="tutor_course.tutor_profile.id", read_only=True)

    start_date = serializers.DateField(source="enrollment.enrolled_at", read_only=True)
    completed_date = serializers.DateField(source="completed_at", read_only=True)

    class Meta:
        model = StudentCourseCompletion
        fields = [
            "id",
            "student_profile",
            "enrollment",
            "tutor_course",
            "student_name",
            "course_title",
            "course_category",
            "course_duration",
            "course_level",
            "course_description",
            "start_date",
            "completed_date",
            "completed_at",
        ]

        read_only_fields = [
            "student_profile",
            "completed_at",
            "student_name",
            "course_title",
            "course_category",
            "course_duration",
            "course_level",
            "course_description",
            "start_date",
            "completed_date",
        ]

