# LMS UI-only Auth - Implementation Checklist

## Auth (client only)
- [x] Read existing auth components
- [x] Update `client/src/components/authentication/sign_up.jsx` to remove backend calls and validate username==password
- [x] Update `client/src/components/authentication/sign_in.jsx` to remove backend calls and validate username==password
- [x] Implement localStorage account storage for sign-up/sign-in
- [x] Verify redirects and role-based route protection

## Placeholder pages
- [ ] Keep `ExploreCourse` and `TutorCourse` UI-only (no backend)

