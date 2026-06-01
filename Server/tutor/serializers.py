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