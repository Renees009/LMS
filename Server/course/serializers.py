from rest_framework import serializers

from course.models import (
    Course,
    Lesson,
    StudentLessonCompletion,
    CourseComment,
)


class LessonSerializer(serializers.ModelSerializer):

    video_url = serializers.SerializerMethodField()
    material_url = serializers.SerializerMethodField()

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

    def get_video_url(self, obj):
        if not obj.video_file:
            return ""
        request = self.context.get("request")
        try:
            if request:
                return request.build_absolute_uri(obj.video_file.url)
        except Exception:
            pass
        return obj.video_file.url

    def get_material_url(self, obj):
        if not obj.material_file:
            return ""
        request = self.context.get("request")
        try:
            if request:
                return request.build_absolute_uri(obj.material_file.url)
        except Exception:
            pass
        return obj.material_file.url


class CourseSerializer(serializers.ModelSerializer):

    thumbnail_url = serializers.SerializerMethodField()
    lessons = LessonSerializer(many=True, read_only=True)

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
            "lessons",
        ]

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail:
            return ""
        try:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
        except Exception:
            pass
        return obj.thumbnail.url


class LessonCompletionSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentLessonCompletion

        fields = [
            "id",
            "student_profile",
            "lesson",
            "completed_at",
        ]

        read_only_fields = [
            "id",
            "student_profile",
            "completed_at",
        ]


class CourseProgressSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    total_lessons = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    progress_percentage = serializers.FloatField()
    next_lesson_id = serializers.IntegerField(allow_null=True)

    def to_representation(self, instance):
        return instance


class CourseCommentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student_profile.student_name", read_only=True)
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CourseComment
        fields = [
            "id",
            "course",
            "student_profile",
            "student_name",
            "profile_image_url",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "student_profile", "created_at"]

    def get_profile_image_url(self, obj):
        profile = obj.student_profile
        if not profile.profile_image:
            return ""
        request = self.context.get("request")
        try:
            if request:
                return request.build_absolute_uri(profile.profile_image.url)
        except Exception:
            pass
        return profile.profile_image.url