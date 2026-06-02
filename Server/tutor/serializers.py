from rest_framework import serializers

from .models import TutorCourse, TutorProfile

from course.models import Lesson
from student.serializers import StudentCourseCompletionSerializer


class TutorCourseLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "order",
            "title",
            "description",
            "video_url",
            "material_url",
        ]


class TutorEnrollmentSerializer(StudentCourseCompletionSerializer):

    class Meta(StudentCourseCompletionSerializer.Meta):
        model = StudentCourseCompletionSerializer.Meta.model
        fields = StudentCourseCompletionSerializer.Meta.fields


class TutorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorProfile
        fields = [
            "id",
            "user",
            "tutor_name",
            "specialization",
            "contact_number",
            "email",
            "tutor_bio",
            "profile_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]


class TutorCourseSerializer(serializers.ModelSerializer):
    """Returns Course fields for a tutor-owned course."""

    # Flatten related course fields for simpler frontend rendering
    course_id = serializers.IntegerField(source="course.id", read_only=True)
    title = serializers.CharField(source="course.title", read_only=True)
    category = serializers.CharField(source="course.category", read_only=True)
    duration = serializers.IntegerField(source="course.duration", read_only=True)
    level = serializers.CharField(source="course.level", read_only=True)
    description = serializers.CharField(source="course.description", read_only=True)

    class Meta:
        model = TutorCourse
        fields = [
            "course_id",
            "title",
            "category",
            "duration",
            "level",
            "description",
            "start_date",
            "end_date",
            "notes",
        ]

