from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from course.models import Lesson
from tutor.models import TutorCourse
from student.models import StudentCourseCompletion


from .serializers import TutorCourseLessonSerializer, TutorEnrollmentSerializer
from .serializers import TutorProfileSerializer

from tutor.models import TutorProfile

from student.serializers import StudentCourseCompletionSerializer


from django.core.files.storage import default_storage
from django.utils.text import slugify

import os


class TutorProfileMeRetrieveUpdateView(generics.GenericAPIView):
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile = TutorProfileSerializer.Meta.model.objects.filter(user=request.user).first()
        if not profile:
            profile = TutorProfileSerializer.Meta.model.objects.create(user=request.user, tutor_bio="")

        serializer = self.serializer_class(profile)
        data = serializer.data
        data["username"] = request.user.username
        return Response(data)

    def put(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def patch(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def _update(self, request, partial: bool):
        profile = TutorProfileSerializer.Meta.model.objects.get_or_create(user=request.user, defaults={"tutor_bio": ""})[0]
        serializer = self.serializer_class(profile, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        profile = TutorProfileSerializer.Meta.model.objects.get_or_create(user=request.user, defaults={"tutor_bio": ""})[0]
        if getattr(profile, "profile_image", None):
            try:
                profile.profile_image.delete(save=False)
            except Exception:
                pass
        profile.profile_image = None
        profile.save(update_fields=["profile_image"])
        serializer = self.serializer_class(profile)
        data = serializer.data
        data["username"] = request.user.username
        return Response(data, status=status.HTTP_200_OK)


class TutorCourseByCourseIdListView(generics.ListAPIView):
    serializer_class = TutorCourseLessonSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Lesson.objects.none()


class TutorCoursesOwnedByMeListView(generics.ListAPIView):
    """List courses owned by the logged-in tutor."""

    serializer_class = None  # set below to avoid circular import
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from tutor.models import TutorCourse as TutorCourseModel

        # TutorCourse model FK: tutor_profile -> TutorProfile -> user
        return (
            TutorCourseModel.objects.select_related("course")
            .filter(tutor_profile__user=self.request.user)
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        from tutor.serializers import TutorCourseSerializer

        return TutorCourseSerializer


class TutorEnrollmentByTutorCourseIdListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id: int):
       
        tutor_course = get_object_or_404(
            TutorCourse.objects.select_related("course", "tutor_profile"),
            id=course_id,
            tutor_profile__user=request.user,
        )

        completions = (
            StudentCourseCompletion.objects.select_related(
                "student_profile",
                "enrollment",
                "enrollment__course",
                "tutor_course",
                "tutor_course__tutor_profile",
            )
            .filter(tutor_course=tutor_course)
            .order_by("-completed_at")
        )

        data = StudentCourseCompletionSerializer(completions, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class TutorLessonUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, course_id: int, lesson_id: int):
        # course_id is tutor_course.id (frontend uses tutor_course.id)
        tutor_course = get_object_or_404(
            TutorCourse.objects.select_related("course", "tutor_profile"),
            id=course_id,
            tutor_profile__user=request.user,
        )

        lesson = get_object_or_404(Lesson, id=lesson_id, course_id=tutor_course.course_id)

        title = request.data.get("title", None)
        description = request.data.get("description", None)
        material_file = request.FILES.get("material")
        video_file = request.FILES.get("video")

        if title is not None:
            lesson.title = title
        if description is not None:
            lesson.description = description

        if video_file:
            ext = ""
            if "." in video_file.name:
                ext = video_file.name.split(".")[-1]
            safe_course = slugify(tutor_course.course.title)[:50] or f"course_{tutor_course.course.id}"
            safe_lesson = slugify(lesson.title)[:50] or f"lesson_{lesson.id}"
            save_name = (
                f"lesson_videos/course_{tutor_course.course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}.{ext}"
                if ext
                else f"lesson_videos/course_{tutor_course.course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}"
            )
            lesson.video_url = default_storage.save(save_name, video_file)

        if material_file:
            ext = ""
            if "." in material_file.name:
                ext = material_file.name.split(".")[-1]
            safe_course = slugify(tutor_course.course.title)[:50] or f"course_{tutor_course.course.id}"
            safe_lesson = slugify(lesson.title)[:50] or f"lesson_{lesson.id}"
            save_name = (
                f"lesson_materials/course_{tutor_course.course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}.{ext}"
                if ext
                else f"lesson_materials/course_{tutor_course.course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}"
            )
            lesson.material_url = default_storage.save(save_name, material_file)

        lesson.save()

        return Response(TutorCourseLessonSerializer(lesson).data, status=status.HTTP_200_OK)

