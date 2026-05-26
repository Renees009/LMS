from rest_framework import generics, permissions

from .models import Course
from .serializers import CourseSerializer


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Course.objects.all().order_by("-created_at")


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    queryset = Course.objects.all()

