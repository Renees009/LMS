from django.contrib import admin

from .models import TutorCourse, TutorProfile


@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "tutor_name",
        "specialization",
        "contact_number",
        "email",
        "created_at",
        "updated_at",
    )
    search_fields = ("tutor_name", "specialization", "email", "user__username")
    ordering = ("-created_at",)



@admin.register(TutorCourse)
class TutorCourseAdmin(admin.ModelAdmin):
    list_display = ("id", "tutor_profile", "course", "start_date", "end_date", "created_at")
    list_filter = ("start_date", "end_date", "course__category", "course__level")
    search_fields = (
        "tutor_profile__tutor_name",
        "tutor_profile__user__username",
        "course__title",
        "course__category",
        "course__level",
    )
    ordering = ("-created_at",)
    autocomplete_fields = ("tutor_profile", "course")

