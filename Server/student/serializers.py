from django.db.utils import OperationalError, ProgrammingError
from rest_framework import serializers

from course.models import Course
from tutor.models import TutorCourse

from .models import StudentProfile, StudentCourseEnrollment, StudentCourseCompletion


class CourseBriefSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "thumbnail_url",
            "category",
            "duration",
            "level",
            "description",
        ]

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail:
            return ""
        request = self.context.get("request")
        try:
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
        except Exception:
            pass
        return obj.thumbnail.url


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
    student_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseBriefSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False)
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_category = serializers.CharField(source="course.category", read_only=True)
    course_duration = serializers.IntegerField(source="course.duration", read_only=True)
    course_level = serializers.CharField(source="course.level", read_only=True)
    course_description = serializers.CharField(source="course.description", read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    progress = serializers.IntegerField(read_only=True)
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    def get_enrollment_count(self, obj):
        return StudentCourseEnrollment.objects.filter(course=obj.course).count()

    def get_total_lessons(self, obj):
        return obj.course.lessons.count()

    def get_completed_lessons(self, obj):
        try:
            from course.models import StudentLessonCompletion
            return StudentLessonCompletion.objects.filter(
                student_profile=obj.student_profile,
                lesson__course=obj.course
            ).count()
        except (ProgrammingError, OperationalError):
            return 0
        except Exception:
            return 0

    class Meta:
        model = StudentCourseEnrollment
        fields = [
            "id",
            "student_profile",
            "course",
            "course_id",
            "course_title",
            "course_category",
            "course_duration",
            "course_level",
            "course_description",
            "status",
            "enrolled_at",
            "enrollment_count",
            "progress",
            "completed_lessons",
            "total_lessons",
            "recent_quiz_score",
            "recent_quiz_grade",
        ]



class StudentCourseCompletionSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(source="student_profile.student_name", read_only=True)

    tutor_details = serializers.CharField(source="tutor_course.tutor_profile.tutor_name", read_only=True)
    tutor_id = serializers.IntegerField(source="tutor_course.tutor_profile.id", read_only=True)

    start_date = serializers.DateField(source="enrollment.enrolled_at", read_only=True)
    completed_date = serializers.DateField(source="completed_at", read_only=True)

    title = serializers.CharField(source="enrollment.course.title", read_only=True)
    
    thumbnail_url = serializers.SerializerMethodField()
    course_thumbnail_url = serializers.SerializerMethodField()

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
            "course_thumbnail_url",
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

    def get_thumbnail_url(self, obj):
        course = obj.enrollment.course
        if not course.thumbnail:
            return ""
        request = self.context.get("request")
        try:
            if request:
                return request.build_absolute_uri(course.thumbnail.url)
        except Exception:
            pass
        return course.thumbnail.url

    def get_course_thumbnail_url(self, obj):
        return self.get_thumbnail_url(obj)
