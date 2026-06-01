from rest_framework import serializers

from course.models import Course, Lesson, StudentLessonCompletion


class CourseSerializer(serializers.ModelSerializer):
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

class LessonSerializer(serializers.ModelSerializer):
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
        # instance is a dict
        return instance

