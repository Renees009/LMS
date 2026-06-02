from django.contrib import admin

from .models import Course, Lesson, StudentLessonCompletion


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "duration",
        "level",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "category",
        "level",
        "created_at",
    )

    search_fields = (
        "title",
        "category",
        "level",
        "description",
    )

    ordering = ("-created_at",)

    inlines = [LessonInline]


