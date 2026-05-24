# LMS Auth JWT Feature - Implementation Checklist

## Frontend
- [ ] Add React Router setup in `client/src/App.jsx`
- [ ] Implement `client/src/components/authentication/sign_up.jsx` (student/tutor choice + fields)
- [ ] Implement `client/src/components/authentication/sign_in.jsx` (username/password)
- [ ] Add auth API helper (JWT login/signup + role storage)
- [ ] Add minimal placeholder pages:
  - [ ] `client/src/components/student/explore_course.jsx`
  - [ ] `client/src/components/tutor/tutor_course.jsx`

## Backend
- [ ] Add JWT auth endpoints to Django:
  - [ ] models for student/tutor role
  - [ ] signup + signin endpoints
- [ ] Wire endpoints in `Server/backend/urls.py`

## Testing
- [ ] Install missing frontend deps (react-router-dom)
- [ ] Run Django + Vite and verify:
  - [ ] signup student -> signin -> redirect to explore
  - [ ] signup tutor -> signin -> redirect to tutor courses

