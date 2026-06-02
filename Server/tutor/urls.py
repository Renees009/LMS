from django.urls import path

from .views import (
    TutorEnrollmentByTutorCourseIdListView,
    TutorLessonUpdateView,
    TutorCoursesOwnedByMeListView,
)

urlpatterns = [
    path(
        "courses/",
        TutorCoursesOwnedByMeListView.as_view(),
        name="tutor-courses-owned-by-me",
    ),

    path(
        "courses/<int:course_id>/lessons/<int:lesson_id>/",
        TutorLessonUpdateView.as_view(),
        name="tutor-lesson-update",
    ),

    path(
        "courses/<int:course_id>/enrollments/",
        TutorEnrollmentByTutorCourseIdListView.as_view(),
        name="tutor-enrollments",
    ),
]


