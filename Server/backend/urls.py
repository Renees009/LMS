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
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter


from api.views import home

from course.views import CourseListView, CourseDetailView
from tutor.views import TutorCourseByCourseIdListView, TutorProfileMeRetrieveUpdateView
from auth.views import TutorPasswordChangeView


from student.views import (
    StudentMeEnrollmentListCreateView,
    StudentMeCompletionListCreateView,
    StudentMeProfileView,
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from auth.views import SignupView, LoginView



urlpatterns = [


    path('admin/', admin.site.urls),

    # JWT auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Signup (creates user + profile and returns JWT)
    path('api/auth/signup/', SignupView.as_view(), name='auth-signup'),
    # Login (authenticates user and returns JWT)
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),


    path('', home),

    # Course
    path('api/courses/', CourseListView.as_view(), name='courses-list'),
    path('api/courses/<int:pk>/', CourseDetailView.as_view(), name='courses-detail'),

    # TutorCourse
    path('api/tutor-courses/', TutorCourseByCourseIdListView.as_view(), name='tutor-courses'),

    # Tutor Profile (me)
    path('api/tutor/me/profile/', TutorProfileMeRetrieveUpdateView.as_view(), name='tutor-me-profile'),

    # Tutor Password Change
    path('api/tutor/me/password/', TutorPasswordChangeView.as_view(), name='tutor-me-password'),


    # Student Profile (me)
    path('api/student/me/profile/', StudentMeProfileView.as_view(), name='student-me-profile'),

    # Student
    path('api/me/enrollments/', StudentMeEnrollmentListCreateView.as_view(), name='me-enrollments'),
    path('api/me/completions/', StudentMeCompletionListCreateView.as_view(), name='me-completions'),
]

# Serve uploaded media in development
if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

