from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from student.models import StudentProfile, StudentCourseEnrollment
from tutor.models import TutorProfile
from course.models import Course

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users (superuser or staff).
    """
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_superuser or request.user.is_staff))

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        students_count = StudentProfile.objects.count()
        tutors_count = TutorProfile.objects.count()
        courses_count = Course.objects.count()
        enrollments_count = StudentCourseEnrollment.objects.count()

        return Response({
            "total_students": students_count,
            "total_tutors": tutors_count,
            "total_courses": courses_count,
            "total_enrollments": enrollments_count,
        }, status=status.HTTP_200_OK)


class AdminUsersListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by("username")
        data = []
        for u in users:
            role = "student"
            name = u.username
            if u.is_superuser or u.is_staff:
                role = "admin"
            elif hasattr(u, "tutorprofile"):
                role = "tutor"
                name = u.tutorprofile.tutor_name or u.username
            elif hasattr(u, "studentprofile"):
                role = "student"
                name = u.studentprofile.student_name or u.username

            data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": role,
                "name": name,
                "is_active": u.is_active,
                "date_joined": u.date_joined.isoformat(),
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminUserRoleUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def put(self, request, user_id: int):
        user_to_mod = get_object_or_404(User, id=user_id)
        new_role = request.data.get("role")

        if new_role not in ["student", "tutor", "admin"]:
            raise ValidationError({"role": "Invalid role specified"})

        # If user is superuser, don't let them demote themselves easily unless they want to
        if user_to_mod == request.user and new_role != "admin":
            return Response({"error": "You cannot demote yourself from admin role"}, status=status.HTTP_400_BAD_REQUEST)

        # Clear existing custom profiles if they change roles
        if new_role == "admin":
            user_to_mod.is_staff = True
            user_to_mod.is_superuser = True
            # Delete profiles to clean up
            StudentProfile.objects.filter(user=user_to_mod).delete()
            TutorProfile.objects.filter(user=user_to_mod).delete()
        elif new_role == "tutor":
            user_to_mod.is_staff = False
            user_to_mod.is_superuser = False
            StudentProfile.objects.filter(user=user_to_mod).delete()
            TutorProfile.objects.get_or_create(
                user=user_to_mod,
                defaults={"tutor_name": user_to_mod.username, "email": user_to_mod.email}
            )
        elif new_role == "student":
            user_to_mod.is_staff = False
            user_to_mod.is_superuser = False
            TutorProfile.objects.filter(user=user_to_mod).delete()
            StudentProfile.objects.get_or_create(
                user=user_to_mod,
                defaults={"student_name": user_to_mod.username, "email": user_to_mod.email}
            )

        user_to_mod.save()

        # Notify user about role change
        from auth.models import Notification
        Notification.objects.create(
            user=user_to_mod,
            message=f"Your account role has been updated to '{new_role}' by Administrator."
        )

        return Response({"message": "User role updated successfully"}, status=status.HTTP_200_OK)

    def delete(self, request, user_id: int):
        user_to_del = get_object_or_404(User, id=user_id)

        if user_to_del == request.user:
            return Response({"error": "You cannot delete your own admin account"}, status=status.HTTP_400_BAD_REQUEST)

        user_to_del.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)


class AdminCoursesListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        courses = Course.objects.all().order_by("-created_at")
        from course.serializers import CourseSerializer
        data = CourseSerializer(courses, many=True, context={"request": request}).data
        return Response(data, status=status.HTTP_200_OK)

    def delete(self, request, course_id: int):
        course = get_object_or_404(Course, id=course_id)
        title = course.title
        course.delete()

        return Response({"message": f"Course '{title}' deleted successfully"}, status=status.HTTP_200_OK)
