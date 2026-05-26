from rest_framework import generics, permissions

from .models import TutorCourse
from .serializers import TutorCourseSerializer


class TutorCourseByCourseIdListView(generics.ListAPIView):
    serializer_class = TutorCourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        course_id = self.request.query_params.get("course_id")
        qs = TutorCourse.objects.select_related("course", "tutor_profile")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

