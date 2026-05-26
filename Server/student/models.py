from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Student details
    student_name = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.student_name or str(self.user)


class StudentCourseEnrollment(models.Model):
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        "course.Course",
        on_delete=models.CASCADE,
        related_name="enrollments",
    )

    status = models.CharField(max_length=50, default="enrolled")
    enrolled_at = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student_profile", "course")

    def __str__(self):
        return f"{self.student_profile} - {self.course.title}"


class StudentCourseCompletion(models.Model):
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="completions",
    )
    enrollment = models.ForeignKey(
        StudentCourseEnrollment,
        on_delete=models.CASCADE,
        related_name="completion",
    )

    tutor_course = models.ForeignKey(
        "tutor.TutorCourse",
        on_delete=models.CASCADE,
        related_name="completions",
    )

    completed_at = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("enrollment",)

    def __str__(self):
        return f"Completed: {self.enrollment.course.title} by {self.student_profile}" 

