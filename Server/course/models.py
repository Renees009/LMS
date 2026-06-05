from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=255)

    thumbnail = models.ImageField(
        upload_to="course_thumbnails/",
        blank=True,
        null=True,
    )

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

    description = models.TextField(
        blank=True,
        default="",
    )

    video_file = models.FileField(
        upload_to="lesson_videos/",
        blank=True,
        null=True,
    )

    material_file = models.FileField(
        upload_to="lesson_materials/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("course", "order")
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - Lesson {self.order}: {self.title}"


class Quiz(models.Model):
    course = models.ForeignKey(
        "course.Course",
        on_delete=models.CASCADE,
        related_name="quizzes",
    )
    title = models.CharField(max_length=255)
    tutor_created = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.title} - Quiz: {self.title}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(
        "course.Quiz",
        on_delete=models.CASCADE,
        related_name="questions",
    )
    order = models.PositiveIntegerField()
    question = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)

    class Meta:
        unique_together = ("quiz", "order")
        ordering = ["order"]

    def __str__(self):
        return f"{self.quiz.course.title} - Q{self.order}: {self.question[:50]}"


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