# TODO

## Completed
- [ ] (none yet)

## Planned Implementation (Tutor profile image + settings)
1. [x] Backend: add DELETE support to `TutorProfileMeRetrieveUpdateView` to remove tutor `profile_image` from storage and set DB field to null.

2. [x] Backend: implement tutor password change endpoint (verify old password; set new password).
3. [x] Frontend: add delete icon/button near tutor avatar that calls DELETE endpoint.

4. [x] Frontend: update tutor settings page to call password-change endpoint (old/new/confirm) and show masked old password (no exact password display).

5. [x] Test flow: upload -> display -> delete -> settings password change end-to-end.



