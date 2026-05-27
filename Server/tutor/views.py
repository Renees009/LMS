from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import TutorCourse, TutorProfile
from .serializers import TutorCourseSerializer, TutorProfileSerializer



class TutorCourseByCourseIdListView(generics.ListAPIView):
    serializer_class = TutorCourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        course_id = self.request.query_params.get("course_id")
        qs = TutorCourse.objects.select_related("course", "tutor_profile")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs


class TutorProfileMeRetrieveUpdateView(generics.GenericAPIView):
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile = TutorProfile.objects.filter(user=request.user).first()
        if not profile:
            profile = TutorProfile.objects.create(user=request.user, tutor_bio="")
        serializer = self.serializer_class(profile)
        data = serializer.data
        # include fullname as requested (user,username)
        data["username"] = request.user.username
        return Response(data)

    def put(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def patch(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def _update(self, request, partial: bool):
        profile, _ = TutorProfile.objects.get_or_create(user=request.user, defaults={"tutor_bio": ""})
        serializer = self.serializer_class(profile, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


