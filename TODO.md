# TODO - LMS MySQL + Django + React (Tutor/Student/Course)

## Backend (Django + DRF)
- [ ] Update `Server/backend/settings.py`:
  - [ ] Add `course`, `student`, `tutor` to `INSTALLED_APPS`
  - [ ] Add `rest_framework`
- [ ] Implement models:
  - [ ] `Server/course/models.py`: `Course`
  - [ ] `Server/tutor/models.py`: `TutorProfile`, `TutorCourse`
  - [ ] `Server/student/models.py`: `StudentProfile`, `StudentCourseEnrollment`, `StudentCourseCompletion`
- [ ] Add DRF serializers + views (viewsets or APIViews):
  - [ ] Course list/detail
  - [ ] TutorCourse list for a course (or by tutor)
  - [ ] Student enrollment list/create
  - [ ] Student completion list/create
- [ ] Update routing:
  - [ ] `Server/backend/urls.py` to include DRF routes under `/api/`
- [ ] Register admin (optional but recommended):
  - [ ] `Server/*/admin.py`
- [ ] Create migrations + migrate to MySQL

## Frontend (React)
- [ ] Add API calls/base URL in client
- [ ] Update components:
  - [ ] `student/explore_course.jsx`
  - [ ] `student/enrolled_course.jsx`
  - [ ] `student/completed_course.jsx`
  - [ ] `tutor/tutor_course.jsx`
  - [ ] `tutor/add_course.jsx`, `tutor/edit_course.jsx`

## Testing
- [ ] Verify endpoints with browser/Postman
- [ ] Verify UI pages load data

