from django.contrib import admin

from .models import (
    StudentCourseCompletion,
    StudentCourseEnrollment,
    StudentProfile,
)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "student_name", "created_at", "updated_at")
    search_fields = ("student_name", "user__username")
    ordering = ("-created_at",)


@admin.register(StudentCourseEnrollment)
class StudentCourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student_profile",
        "course",
        "status",
        "enrolled_at",
        "recent_quiz_score",
        "recent_quiz_grade",
    )
    list_filter = ("status", "enrolled_at", "course__category", "course__level")
    search_fields = (
        "student_profile__student_name",
        "student_profile__user__username",
        "course__title",
        "course__category",
        "course__level",
    )
    ordering = ("-enrolled_at",)
    autocomplete_fields = ("student_profile", "course")


from .models import StudentQuizAttempt


@admin.register(StudentQuizAttempt)
class StudentQuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "student_profile", "course", "score", "grade", "is_passed", "attempted_at")
    list_filter = ("is_passed", "attempted_at", "course__title")
    search_fields = ("student_profile__student_name", "course__title")
    ordering = ("-attempted_at",)
    autocomplete_fields = ("student_profile", "course")


@admin.register(StudentCourseCompletion)
class StudentCourseCompletionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student_profile",
        "enrollment",
        "tutor_course",
        "completed_at",
    )

    list_filter = ("completed_at", "enrollment__status", "enrollment__course__category", "enrollment__course__level")
    search_fields = (
        "student_profile__student_name",
        "student_profile__user__username",
        "enrollment__course__title",
        "tutor_course__tutor_profile__tutor_name",
    )
    ordering = ("-completed_at",)
    autocomplete_fields = ("student_profile", "enrollment", "tutor_course")
