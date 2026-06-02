# TODO - Fix profile/tutor thumbnail images not displaying

- [x] Update backend serializers to return `profile_image_url` as an absolute URL using `request.build_absolute_uri(...)`.
  - [x] Server/student/serializers.py
  - [x] Server/tutor/serializers.py

- [x] Update Server/student/views.py to include `profile_image_url` (and keep `profile_image` fallback).

- [x] Update frontend components to use `profile_image_url` fallback to `profile_image`.
  - [x] client/src/components/student/StudentProfile.jsx
  - [x] client/src/components/tutor/TutorProfile.jsx

- [x] Run backend + frontend and verify images render.



