from rest_framework import serializers

from course.models import Course
from tutor.models import TutorCourse

from .models import StudentProfile, StudentCourseEnrollment, StudentCourseCompletion

class StudentProfileSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "student_name",
            "profile_image",
            "profile_image_url",
        ]
        read_only_fields = ["user"]

    def get_profile_image_url(self, obj):
        if not obj.profile_image:
            return ""
        try:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
        except Exception:
            pass
        return obj.profile_image.url


class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_category = serializers.CharField(source="course.category", read_only=True)
    course_duration = serializers.IntegerField(source="course.duration", read_only=True)
    course_level = serializers.CharField(source="course.level", read_only=True)
    course_description = serializers.CharField(source="course.description", read_only=True)
    enrollment_count = serializers.SerializerMethodField()

    def get_enrollment_count(self, obj):

        return StudentCourseEnrollment.objects.filter(course=obj.course).count()


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
            "enrollment_count",
        ]



class StudentCourseCompletionSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(source="student_profile.student_name", read_only=True)

    tutor_details = serializers.CharField(source="tutor_course.tutor_profile.tutor_name", read_only=True)
    tutor_id = serializers.IntegerField(source="tutor_course.tutor_profile.id", read_only=True)

    start_date = serializers.DateField(source="enrollment.enrolled_at", read_only=True)
    completed_date = serializers.DateField(source="completed_at", read_only=True)

    title = serializers.CharField(source="enrollment.course.title", read_only=True)
    thumbnail_url = serializers.CharField(source="enrollment.course.thumbnail_url", read_only=True, allow_blank=True)


    course_thumbnail_url = serializers.CharField(
        source="enrollment.course.thumbnail_url",
        read_only=True,
        allow_blank=True,
    )
    category = serializers.CharField(source="enrollment.course.category", read_only=True)
    duration = serializers.IntegerField(source="enrollment.course.duration", read_only=True)
    level = serializers.CharField(source="enrollment.course.level", read_only=True)
    description = serializers.CharField(source="enrollment.course.description", read_only=True)

    class Meta:
        model = StudentCourseCompletion
        fields = [
            "id",
            "student_profile",
            "enrollment",
            "tutor_course",
            "student_name",
            "title",
            "thumbnail_url",
            "category",
            "duration",
            "level",
            "description",
            "start_date",
            "completed_date",
            "completed_at",
            "tutor_details",
            "tutor_id",
        ]

        read_only_fields = fields


