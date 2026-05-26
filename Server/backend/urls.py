"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import home
from course.views import CourseListView, CourseDetailView
from tutor.views import TutorCourseByCourseIdListView
from student.views import (
    StudentMeEnrollmentListCreateView,
    StudentMeCompletionListCreateView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),

    # Course
    path('api/courses/', CourseListView.as_view(), name='courses-list'),
    path('api/courses/<int:pk>/', CourseDetailView.as_view(), name='courses-detail'),

    # TutorCourse
    path('api/tutor-courses/', TutorCourseByCourseIdListView.as_view(), name='tutor-courses'),

    # Student
    path('api/me/enrollments/', StudentMeEnrollmentListCreateView.as_view(), name='me-enrollments'),
    path('api/me/completions/', StudentMeCompletionListCreateView.as_view(), name='me-completions'),
]
