Planned backend changes (Django) for LMS lesson/content + enrollment progress

1) Models (Server/course/models.py)
- Lesson: course FK, order (integer), title
- LessonContent: lesson FK, content_type ('text'|'video'), text, video_url (string path; store uploaded file path)
- StudentLessonCompletion: student_profile FK, lesson FK, completed_at
  - unique_together(student_profile, lesson)

2) Serializers (Server/course/serializers.py)
- LessonSerializer
- LessonContentSerializer
- LessonCompletionSerializer
- CourseProgressSerializer (computed fields)

3) Views (Server/course/views.py)
- CourseCreateView (POST, multipart, tutor only)
  - parse form: title/category/duration/level/description/number_of_lessons/lessons JSON
  - create Course
  - create TutorCourse linking tutor_profile
  - create Lesson objects with order
  - create LessonContent per lesson
  - handle uploaded files lesson_video_{i} and lesson_material_{i}:
    - for now store video_url for video file
    - for material optionally store text only (or extend model later)
- CourseLessonsListView (GET /api/courses/<course_id>/lessons/)
- LessonCompleteView (POST /api/courses/lessons/complete/)
- CourseProgressView (GET /api/courses/progress/<course_id>/)
- CourseContinueView (GET /api/courses/continue/<course_id>/)

4) URLs (Server/backend/urls.py)
- wire new endpoints.

5) Migrations
- makemigrations + migrate for course app.

6) Frontend (client/src/components/course/course.jsx)
- build UI: list lessons; show content; completion button; progress % and continue learning

