from django.conf import settings
from django.db import models


class Course(models.Model):
    #course details

    title = models.CharField(max_length=255)

    category = models.CharField(max_length=120)
    duration = models.PositiveIntegerField()
    level = models.CharField(max_length=120)

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

