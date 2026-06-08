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

        serializer = self.serializer_class(profile, context={"request": request})
        data = serializer.data
        data["username"] = request.user.username
        return Response(data)

    def put(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def patch(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def _update(self, request, partial: bool):
        profile = TutorProfileSerializer.Meta.model.objects.get_or_create(user=request.user, defaults={"tutor_bio": ""})[0]
        serializer = self.serializer_class(profile, data=request.data, partial=partial, context={"request": request})
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
        serializer = self.serializer_class(profile, context={"request": request})
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

    serializer_class = None  
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from tutor.models import TutorCourse as TutorCourseModel

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
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

        enrollments = (
            tutor_course.course.enrollments.select_related("student_profile")
            .order_by("-enrolled_at")
        )

        from student.serializers import StudentCourseEnrollmentSerializer
        data = StudentCourseEnrollmentSerializer(
            enrollments, many=True, context={"request": request}
        ).data
        return Response(data, status=status.HTTP_200_OK)


class TutorCourseUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, course_id: int):
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

        course = tutor_course.course

        title = request.data.get("title")
        category = request.data.get("category")
        duration = request.data.get("duration")
        level = request.data.get("level")
        description = request.data.get("description")
        thumbnail = request.FILES.get("thumbnail")

        if title is not None:
            course.title = title
        if category is not None:
            course.category = category
        if duration is not None:
            try:
                course.duration = int(duration)
            except Exception:
                raise ValidationError({"duration": "must be an integer"})
        if level is not None:
            course.level = level
        if description is not None:
            course.description = description
        if thumbnail:
            course.thumbnail = thumbnail

        course.save()

        from course.serializers import CourseSerializer
        return Response(CourseSerializer(course, context={"request": request}).data, status=status.HTTP_200_OK)

    def delete(self, request, course_id: int):
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

        course = tutor_course.course
        course_title = course.title
        course.delete()

        from auth.models import Notification
        from django.contrib.auth.models import User
        admins = User.objects.filter(is_superuser=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"Tutor {request.user.username} deleted the course '{course_title}'."
            )

        return Response({"message": "Course deleted successfully"}, status=status.HTTP_200_OK)


class TutorLessonCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id: int):
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

        course = tutor_course.course

        title = request.data.get("title")
        description = request.data.get("description", "")
        material_file = request.FILES.get("material")
        video_file = request.FILES.get("video")

        if not title:
            raise ValidationError({"title": "title is required"})

        next_order = course.lessons.count() + 1

        lesson = Lesson.objects.create(
            course=course,
            order=next_order,
            title=title,
            description=description,
        )

        if video_file:
            ext = ""
            if "." in video_file.name:
                ext = video_file.name.split(".")[-1]
            safe_course = slugify(course.title)[:50] or f"course_{course.id}"
            safe_lesson = slugify(lesson.title)[:50] or f"lesson_{lesson.id}"
            save_name = (
                f"lesson_videos/course_{course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}.{ext}"
                if ext
                else f"lesson_videos/course_{course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}"
            )
            lesson.video_file = default_storage.save(save_name, video_file)

        if material_file:
            ext = ""
            if "." in material_file.name:
                ext = material_file.name.split(".")[-1]
            safe_course = slugify(course.title)[:50] or f"course_{course.id}"
            safe_lesson = slugify(lesson.title)[:50] or f"lesson_{lesson.id}"
            save_name = (
                f"lesson_materials/course_{course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}.{ext}"
                if ext
                else f"lesson_materials/course_{course.id}/{safe_course}_lesson_{lesson.id}_{safe_lesson}"
            )
            lesson.material_file = default_storage.save(save_name, material_file)

        lesson.save()

        from auth.models import Notification
        enrollments = tutor_course.course.enrollments.all()
        for enrollment in enrollments:
            Notification.objects.create(
                user=enrollment.student_profile.user,
                message=f"A new lesson '{title}' has been added to '{course.title}'."
            )

        return Response(TutorCourseLessonSerializer(lesson).data, status=status.HTTP_201_CREATED)


class TutorLessonUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, course_id: int, lesson_id: int):
       
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

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
            lesson.video_file = default_storage.save(save_name, video_file)

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
            lesson.material_file = default_storage.save(save_name, material_file)

        lesson.save()

        return Response(TutorCourseLessonSerializer(lesson).data, status=status.HTTP_200_OK)


class TutorLessonDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, course_id: int, lesson_id: int):
        
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

        lesson = get_object_or_404(Lesson, id=lesson_id, course_id=tutor_course.course_id)
        deleted_order = lesson.order
        lesson.delete()

       
        subsequent_lessons = Lesson.objects.filter(course_id=tutor_course.course_id, order__gt=deleted_order).order_by("order")
        for idx, les in enumerate(subsequent_lessons, start=deleted_order):
            les.order = idx
            les.save(update_fields=["order"])

        return Response({"message": "Lesson deleted successfully"}, status=status.HTTP_200_OK)


class TutorQuizCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id: int):
        tutor_course = TutorCourse.objects.filter(course_id=course_id, tutor_profile__user=request.user).first()
        if not tutor_course:
            tutor_course = get_object_or_404(TutorCourse, id=course_id, tutor_profile__user=request.user)

        course = tutor_course.course

        title = request.data.get("title") or f"{course.title} Final Quiz"
        questions = request.data.get("questions")
        if not questions or not isinstance(questions, list):
            raise ValidationError({"questions": "questions must be a list of question objects"})

        if len(questions) < 3:
            raise ValidationError({"questions": "At least 3 questions are required"})

        from course.models import Quiz, QuizQuestion

        Quiz.objects.filter(course=course).delete()

        quiz = Quiz.objects.create(course=course, title=title, tutor_created=True)

        created = []
        for idx, q in enumerate(questions, start=1):
            question_text = q.get("question")
            option_a = q.get("option_a")
            option_b = q.get("option_b")
            option_c = q.get("option_c")
            option_d = q.get("option_d")
            correct = q.get("correct_option")

            if not question_text or not option_a or not option_b or not option_c or not option_d or not correct:
                quiz.delete()
                raise ValidationError({"questions": f"All fields required for question {idx}"})

            qq = QuizQuestion.objects.create(
                quiz=quiz,
                order=idx,
                question=question_text,
                option_a=option_a,
                option_b=option_b,
                option_c=option_c,
                option_d=option_d,
                correct_option=correct,
            )
            created.append({"id": qq.id, "order": qq.order})

        return Response({"quiz_id": quiz.id, "created_questions": created}, status=status.HTTP_201_CREATED)

