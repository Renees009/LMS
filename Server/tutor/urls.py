from django.urls import path

from .views import (
    TutorEnrollmentByTutorCourseIdListView,
    TutorLessonUpdateView,
    TutorCoursesOwnedByMeListView,
    TutorQuizCreateView,
    TutorCourseUpdateDeleteView,
    TutorLessonCreateView,
    TutorLessonDeleteView,
)

urlpatterns = [
    path(
        "courses/",
        TutorCoursesOwnedByMeListView.as_view(),
        name="tutor-courses-owned-by-me",
    ),

    path(
        "courses/<int:course_id>/",
        TutorCourseUpdateDeleteView.as_view(),
        name="tutor-course-update-delete",
    ),

    path(
        "courses/<int:course_id>/lessons/",
        TutorLessonCreateView.as_view(),
        name="tutor-lesson-create",
    ),

    path(
        "courses/<int:course_id>/lessons/<int:lesson_id>/",
        TutorLessonUpdateView.as_view(),
        name="tutor-lesson-update",
    ),

    path(
        "courses/<int:course_id>/lessons/<int:lesson_id>/delete/",
        TutorLessonDeleteView.as_view(),
        name="tutor-lesson-delete",
    ),

    path(
        "courses/<int:course_id>/enrollments/",
        TutorEnrollmentByTutorCourseIdListView.as_view(),
        name="tutor-enrollments",
    ),

    path(
        "courses/<int:course_id>/quiz/",
        TutorQuizCreateView.as_view(),
        name="tutor-create-quiz",
    ),
]
