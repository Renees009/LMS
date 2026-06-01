from django.urls import path

from course.views import (
    CourseCreateView,
    CourseContinueView,
    CourseDetailView,
    CourseLessonsListView,
    CourseListView,
    CourseProgressView,
    LessonCompletionCreateView,
)

urlpatterns = [
    path("courses/", CourseListView.as_view(), name="courses-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="courses-detail"),

    path("course/create/", CourseCreateView.as_view(), name="course-create"),
    path("courses/<int:course_id>/lessons/", CourseLessonsListView.as_view(), name="course-lessons"),

    path("courses/lessons/complete/", LessonCompletionCreateView.as_view(), name="lesson-complete"),
    path("courses/progress/<int:course_id>/", CourseProgressView.as_view(), name="course-progress"),
    path("courses/continue/<int:course_id>/", CourseContinueView.as_view(), name="course-continue"),
]

