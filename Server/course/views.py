import json
from django.db.models import Max
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from course.models import Course, Lesson, StudentLessonCompletion, Quiz, QuizQuestion
from course.serializers import (
    CourseProgressSerializer,
    CourseSerializer,
    LessonCompletionSerializer,
    LessonSerializer,
)

from tutor.models import TutorCourse, TutorProfile
from student.models import (
    StudentCourseCompletion,
    StudentCourseEnrollment,
    StudentProfile,
    StudentQuizAttempt,
)
from student.serializers import StudentCourseCompletionSerializer


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Course.objects.all().order_by("-created_at")


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    queryset = Course.objects.all()


class CourseCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        
        tutor_profile = TutorProfile.objects.filter(user=request.user).first()
        if not tutor_profile:
            raise ValidationError({"detail": "Only tutors can create courses"})

        title = request.data.get("title")
        category = request.data.get("category")
        duration = request.data.get("duration")
        level = request.data.get("level")
        description = request.data.get("description")

        number_of_lessons = request.data.get("number_of_lessons")
        try:
            number_of_lessons = int(number_of_lessons)
        except Exception:
            raise ValidationError({"number_of_lessons": "must be an integer"})

        if not title or not category or duration is None or not level or description is None:
            raise ValidationError({"detail": "Missing required course fields"})

        thumbnail = request.FILES.get("thumbnail")

        

        lessons_raw = request.data.get("lessons")

        if not lessons_raw:
            raise ValidationError({"lessons": "lessons is required"})

        try:
            lessons_payload = json.loads(lessons_raw)
        except json.JSONDecodeError:
            raise ValidationError({"lessons": "Invalid JSON"})

        if not isinstance(lessons_payload, list):
            raise ValidationError({"lessons": "Must be a list"})

        if len(lessons_payload) < number_of_lessons:
            raise ValidationError({"lessons": "lessons length must match number_of_lessons"})

        if thumbnail:
            
            pass
        
        course = Course.objects.create(
        title=title,
        thumbnail=thumbnail,
        category=category,
        duration=duration,
        level=level,
        description=description,
    )


        TutorCourse.objects.create(
            tutor_profile=tutor_profile,
            course=course,
        )

        created_lessons = []
        for i in range(number_of_lessons):
            lesson_data = lessons_payload[i] if i < len(lessons_payload) else {}
            lesson_title = lesson_data.get("title")
            lesson_description = lesson_data.get("description", "")

            if not lesson_title:
                raise ValidationError({"lessons": f"Missing title for lesson {i + 1}"})

            lesson = Lesson.objects.create(
                course=course,
                order=i + 1,
                title=lesson_title,
            )

            video_file = request.FILES.get(f"lesson_video_{i}")
            material_file = request.FILES.get(f"lesson_material_{i}")

            from django.core.files.storage import default_storage
            from django.utils.text import slugify


            lesson.description = lesson_description or ""
            if video_file:
                lesson.video_file = video_file

            if material_file:
                lesson.material_file = material_file

            lesson.save()
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
                lesson.video_url = default_storage.save(save_name, video_file)

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
                lesson.material_url = default_storage.save(save_name, material_file)

            lesson.save(update_fields=["description", "video_url", "material_url"])
            created_lessons.append(lesson)

        lessons_payload = LessonSerializer(created_lessons, many=True).data

        return Response(
            {
                "id": course.id,
                "title": course.title,
                "category": course.category,
                "duration": course.duration,
                "level": course.level,
                "description": course.description,
                "number_of_lessons": number_of_lessons,
                "lessons": lessons_payload,
            },
            status=status.HTTP_201_CREATED,
        )



class CourseLessonsListView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        course_id = self.kwargs["course_id"]
        return Lesson.objects.filter(course_id=course_id).select_related("course").order_by("order")


class LessonCompletionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get("lesson") or request.data.get("lesson_id")
        if not lesson_id:
            raise ValidationError({"lesson": "lesson is required"})

        lesson = get_object_or_404(Lesson, id=lesson_id)

        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={"student_name": getattr(request.user, "username", "Student")},
        )

        obj, created = StudentLessonCompletion.objects.get_or_create(
            student_profile=profile,
            lesson=lesson,
        )

        enrollment = StudentCourseEnrollment.objects.filter(
            student_profile=profile,
            course=lesson.course,
        ).first()

        if enrollment:
            completed_count = StudentLessonCompletion.objects.filter(
                student_profile=profile,
                lesson__course=lesson.course,
            ).count()
            total_lessons = lesson.course.lessons.count()
            enrollment.progress = int((completed_count / total_lessons) * 100) if total_lessons else 0
            enrollment.save(update_fields=["progress"])

        return Response(LessonCompletionSerializer(obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id: int):
        profile = get_object_or_404(StudentProfile, user=request.user)

        lessons_qs = Lesson.objects.filter(course_id=course_id)
        total = lessons_qs.count()
        if total == 0:
            return Response(
                {
                    "course_id": course_id,
                    "total_lessons": 0,
                    "completed_lessons": 0,
                    "completed_lesson_ids": [],
                    "progress_percentage": 0.0,
                    "next_lesson_id": None,
                    "course_completed": False,
                },
                status=status.HTTP_200_OK,
            )

        completed_lesson_ids = list(
            StudentLessonCompletion.objects.filter(
                student_profile=profile,
                lesson__course_id=course_id,
            ).values_list("lesson_id", flat=True)
        )

        completed = len(completed_lesson_ids)
        progress_percentage = (completed / total) * 100.0

        enrollment = StudentCourseEnrollment.objects.filter(
            student_profile=profile,
            course_id=course_id,
        ).first()
        if enrollment and enrollment.progress != int(progress_percentage):
            enrollment.progress = int(progress_percentage)
            enrollment.save(update_fields=["progress"])

        next_lesson = (
            lessons_qs.exclude(id__in=completed_lesson_ids)
            .order_by("order")
            .first()
        )

        course_completed = StudentCourseCompletion.objects.filter(
            student_profile=profile,
            enrollment__course_id=course_id,
        ).exists()

        payload = {
            "course_id": course_id,
            "total_lessons": total,
            "completed_lessons": completed,
            "completed_lesson_ids": completed_lesson_ids,
            "progress_percentage": float(progress_percentage),
            "next_lesson_id": next_lesson.id if next_lesson else None,
            "course_completed": course_completed,
        }

        return Response(payload, status=status.HTTP_200_OK)


class CourseQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id: int):
        course = get_object_or_404(Course, id=course_id)

        quiz = Quiz.objects.filter(course=course).order_by("-created_at").first()
        if not quiz:
            return Response({"detail": "No quiz available for this course."}, status=status.HTTP_404_NOT_FOUND)

        questions = []
        for q in quiz.questions.all():
            questions.append({
                "id": q.id,
                "order": q.order,
                "question": q.question,
                "options": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d,
                },
            })

        quiz_payload = {
            "quiz_id": quiz.id,
            "course_id": course.id,
            "title": quiz.title,
            "questions": questions,
        }

        return Response(quiz_payload, status=status.HTTP_200_OK)


class CourseQuizHighestScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id: int):
        profile = get_object_or_404(StudentProfile, user=request.user)
        course = get_object_or_404(Course, id=course_id)

        attempts = StudentQuizAttempt.objects.filter(student_profile=profile, course=course)
        highest_score = attempts.aggregate(Max("score"))["score__max"] or 0
        attempt_count = attempts.count()
        course_completed = StudentCourseCompletion.objects.filter(
            student_profile=profile,
            enrollment__course=course,
        ).exists()

        payload = {
            "highest_score": highest_score,
            "reattempt_count": attempt_count,
            "course_completed": course_completed,
            "highest_score_grade": enrollment.highest_quiz_grade if enrollment else None,
        }

        return Response(payload, status=status.HTTP_200_OK)


class CourseQuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id: int):
        profile = get_object_or_404(StudentProfile, user=request.user)
        course = get_object_or_404(Course, id=course_id)
        answers = request.data.get("answers")
        quiz_id = request.data.get("quiz_id")

        if not answers and quiz_id is None:
            raise ValidationError({"answers": "answers or quiz_id is required"})

        score = None
        total = 0
        correct_count = 0
        if quiz_id:
            quiz = get_object_or_404(Quiz, id=quiz_id, course=course)
            questions = list(quiz.questions.all())
            total = len(questions)
            for q in questions:
                ans = answers.get(str(q.id)) if isinstance(answers, dict) else None
                if ans and ans.upper() == (q.correct_option or '').upper():
                    correct_count += 1

            if total > 0:
                score = int((correct_count / total) * 100)

        if score is None:
            supplied = request.data.get("score")
            if supplied is None:
                raise ValidationError({"score": "score or answers required"})
            score = int(supplied)

        prev_attempts = StudentQuizAttempt.objects.filter(student_profile=profile, course=course)
        attempt_number = prev_attempts.count() + 1

        if attempt_number == 1:
            grade = "O"
        elif attempt_number == 2:
            grade = "A+"
        elif attempt_number == 3:
            grade = "A"
        elif attempt_number == 4:
            grade = "B+"
        else:
            grade = "B"

        passed = score > 60

        StudentQuizAttempt.objects.create(
            student_profile=profile,
            course=course,
            score=score,
            answers=answers,
            is_passed=passed,
            grade=grade,
        )

        enrollment = StudentCourseEnrollment.objects.filter(student_profile=profile, course=course).first()
        if enrollment:
            if score > (enrollment.highest_quiz_score or 0):
                enrollment.highest_quiz_score = score
                enrollment.highest_quiz_grade = grade
                enrollment.save(update_fields=["highest_quiz_score", "highest_quiz_grade"]) 

        if passed:
            tutor_course = TutorCourse.objects.filter(course=course).first()
            if tutor_course:
                StudentCourseCompletion.objects.get_or_create(
                    student_profile=profile,
                    enrollment=enrollment,
                    tutor_course=tutor_course,
                )

        attempts = StudentQuizAttempt.objects.filter(student_profile=profile, course=course)
        highest_score = attempts.aggregate(Max("score"))["score__max"] or 0
        attempt_count = attempts.count()
        course_completed = StudentCourseCompletion.objects.filter(
            student_profile=profile,
            enrollment__course=course,
        ).exists()

        return Response(
            {
                "highest_score": highest_score,
                "reattempt_count": attempt_count,
                "course_completed": course_completed,
                "passed": passed,
                "grade": grade,
                "attempt_score": score,
            },
            status=status.HTTP_201_CREATED,
        )


class CourseCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id: int):
        profile = get_object_or_404(StudentProfile, user=request.user)
        course = get_object_or_404(Course, id=course_id)
        enrollment = get_object_or_404(StudentCourseEnrollment, student_profile=profile, course=course)
        tutor_course = TutorCourse.objects.filter(course=course).first()

        if not tutor_course:
            raise ValidationError({"detail": "No tutor course found for this course."})

        completion, created = StudentCourseCompletion.objects.get_or_create(
            student_profile=profile,
            enrollment=enrollment,
            tutor_course=tutor_course,
        )

        if enrollment.status != "completed":
            enrollment.status = "completed"
            enrollment.save(update_fields=["status"])

        serializer = StudentCourseCompletionSerializer(completion)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CourseContinueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id: int):
        profile = get_object_or_404(StudentProfile, user=request.user)

        lessons_qs = Lesson.objects.filter(course_id=course_id).order_by("order")
        completed_ids = set(
            StudentLessonCompletion.objects.filter(
                student_profile=profile,
                lesson__course_id=course_id,
            ).values_list("lesson_id", flat=True)
        )

        next_lesson = lessons_qs.exclude(id__in=completed_ids).first()
        if not next_lesson:
            return Response({"next_lesson": None}, status=status.HTTP_200_OK)

        return Response({"next_lesson": LessonSerializer(next_lesson).data}, status=status.HTTP_200_OK)

