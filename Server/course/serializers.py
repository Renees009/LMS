from rest_framework import serializers

from course.models import (
    Course,
    Lesson,
    StudentLessonCompletion,
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
        if obj.video_file:
            return obj.video_file.url
        return ""

    def get_material_url(self, obj):
        if obj.material_file:
            return obj.material_file.url
        return ""


class CourseSerializer(serializers.ModelSerializer):

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
        if obj.thumbnail:
            return obj.thumbnail.url
        return ""


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