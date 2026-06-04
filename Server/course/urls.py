from django.urls import path

from course.views import (
    CourseCompleteView,
    CourseContinueView,
    CourseDetailView,
    CourseLessonsListView,
    CourseListView,
    CourseProgressView,
    CourseQuizHighestScoreView,
    CourseQuizSubmitView,
    CourseQuizView,
    CourseCreateView,
    LessonCompletionCreateView,
)

urlpatterns = [
    path("courses/", CourseListView.as_view(), name="courses-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="courses-detail"),

    path("course/create/", CourseCreateView.as_view(), name="course-create"),
    path("courses/<int:course_id>/lessons/", CourseLessonsListView.as_view(), name="course-lessons"),

    path("courses/lessons/complete/", LessonCompletionCreateView.as_view(), name="lesson-complete"),
    path("courses/progress/<int:course_id>/", CourseProgressView.as_view(), name="course-progress"),
    path("courses/<int:course_id>/quiz/", CourseQuizView.as_view(), name="course-quiz"),
    path("courses/<int:course_id>/quiz/highest-score/", CourseQuizHighestScoreView.as_view(), name="course-quiz-highest-score"),
    path("courses/<int:course_id>/quiz/submit/", CourseQuizSubmitView.as_view(), name="course-quiz-submit"),
    path("courses/<int:course_id>/complete/", CourseCompleteView.as_view(), name="course-complete"),
    path("courses/continue/<int:course_id>/", CourseContinueView.as_view(), name="course-continue"),
]

