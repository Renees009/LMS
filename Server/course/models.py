from django.conf import settings
from django.db import models


class Course(models.Model):
 

    title = models.CharField(max_length=255)
    thumbnail_url = models.CharField(max_length=500, blank=True)

    category = models.CharField(max_length=120)
    duration = models.PositiveIntegerField()
    level = models.CharField(max_length=120)

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(
        "course.Course",
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    order = models.PositiveIntegerField()
    title = models.CharField(max_length=255)

    description = models.TextField(blank=True, default="")

    video_url = models.CharField(max_length=500, blank=True, default="")
    material_url = models.CharField(max_length=500, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("course", "order")
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - Lesson {self.order}: {self.title}"


class StudentLessonCompletion(models.Model):
    student_profile = models.ForeignKey(
        "student.StudentProfile",
        on_delete=models.CASCADE,
        related_name="lesson_completions",
    )
    lesson = models.ForeignKey(
        "course.Lesson",
        on_delete=models.CASCADE,
        related_name="completions",
    )
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student_profile", "lesson")
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.student_profile} completed {self.lesson}" 

