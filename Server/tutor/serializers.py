from rest_framework import serializers

from .models import TutorProfile, TutorCourse


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
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_category = serializers.CharField(source="course.category", read_only=True)
    course_duration = serializers.IntegerField(source="course.duration", read_only=True)
    course_level = serializers.CharField(source="course.level", read_only=True)
    course_description = serializers.CharField(source="course.description", read_only=True)

    tutor_details = serializers.CharField(source="tutor_profile.tutor_name", read_only=True)

    class Meta:
        model = TutorCourse
        fields = [
            "id",
            "tutor_profile",
            "course",
            "course_title",
            "tutor_details",
            "course_category",
            "course_duration",
            "course_level",
            "course_description",
            "start_date",
            "end_date",
            "notes",
        ]

