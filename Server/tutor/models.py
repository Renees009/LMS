from django.conf import settings
from django.db import models


class TutorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    tutor_name = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    contact_number = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)

    tutor_bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to="tutor_profiles/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.tutor_name or str(self.user)


class TutorCourse(models.Model):
    tutor_profile = models.ForeignKey(TutorProfile, on_delete=models.CASCADE, related_name="tutor_courses")
    course = models.ForeignKey("course.Course", on_delete=models.CASCADE, related_name="tutor_courses")

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tutor_profile", "course")

    def __str__(self):
        return f"{self.tutor_profile} - {self.course.title}"

