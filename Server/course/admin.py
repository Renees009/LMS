from django.contrib import admin

from .models import Course, Lesson, StudentLessonCompletion
from .models import Quiz, QuizQuestion


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1


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


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "tutor_created", "created_at")
    list_filter = ("tutor_created", "created_at", "course__category")
    search_fields = ("title", "course__title")
    ordering = ("-created_at",)
    inlines = [QuizQuestionInline]


