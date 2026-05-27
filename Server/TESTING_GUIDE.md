# Quick Testing Guide - Authentication System

## Prerequisites
- Django server running: `python manage.py runserver`
- MySQL database connected
- REST client (Postman, Insomnia, or cURL)

## Test 1: Student Signup

**URL**: `POST http://localhost:8000/api/auth/signup/`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "username": "student_test_01",
  "password": "TestPass@123",
  "email": "student.test@example.com",
  "role": "student",
  "fullName": "Test Student",
  "phone": "+1234567890"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "username": "student_test_01",
  "email": "student.test@example.com",
  "role": "student",
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

**Verify in MySQL**:
```sql
SELECT * FROM auth_user WHERE username = 'student_test_01';
SELECT * FROM student_studentprofile WHERE student_name = 'Test Student';
```

---

## Test 2: Tutor Signup

**URL**: `POST http://localhost:8000/api/auth/signup/`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "username": "tutor_test_01",
  "password": "TestPass@123",
  "email": "tutor.test@example.com",
  "role": "tutor",
  "tutorName": "Test Tutor",
  "specialization": "Mathematics",
  "contactNumber": "+9876543210"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 2,
  "username": "tutor_test_01",
  "email": "tutor.test@example.com",
  "role": "tutor",
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

**Verify in MySQL**:
```sql
SELECT * FROM auth_user WHERE username = 'tutor_test_01';
SELECT * FROM tutor_tutorprofile WHERE tutor_name = 'Test Tutor';
```

---

## Test 3: Student Login

**URL**: `POST http://localhost:8000/api/auth/login/`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "username": "student_test_01",
  "password": "TestPass@123"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "username": "student_test_01",
  "email": "student.test@example.com",
  "role": "student",
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

**Note**: Save the access token for subsequent requests

---

## Test 4: Get Student Profile

**URL**: `GET http://localhost:8000/api/student/me/profile/`

**Headers**:
```
Authorization: Bearer <access_token_from_test_3>
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "student_name": "Test Student",
  "email": "student.test@example.com",
  "phone": "+1234567890",
  "bio": "",
  "created_at": "2026-05-27T...",
  "updated_at": "2026-05-27T..."
}
```

---

## Test 5: Update Student Profile

**URL**: `PUT http://localhost:8000/api/student/me/profile/`

**Headers**:
```
Authorization: Bearer <access_token_from_test_3>
Content-Type: application/json
```

**Body**:
```json
{
  "student_name": "Updated Test Student",
  "email": "newemail@example.com",
  "phone": "+9999999999",
  "bio": "I am learning Django REST Framework"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "student_name": "Updated Test Student",
  "email": "newemail@example.com",
  "phone": "+9999999999",
  "bio": "I am learning Django REST Framework",
  "created_at": "2026-05-27T...",
  "updated_at": "2026-05-27T... (updated)"
}
```

**Verify in MySQL**:
```sql
SELECT * FROM student_studentprofile WHERE id = 1;
SELECT email FROM auth_user WHERE id = 1;  -- Should also be updated
```

---

## Test 6: Tutor Login

**URL**: `POST http://localhost:8000/api/auth/login/`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "username": "tutor_test_01",
  "password": "TestPass@123"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 2,
  "username": "tutor_test_01",
  "email": "tutor.test@example.com",
  "role": "tutor",
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

---

## Test 7: Get Tutor Profile

**URL**: `GET http://localhost:8000/api/tutor/me/profile/`

**Headers**:
```
Authorization: Bearer <tutor_access_token>
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "tutor_name": "Test Tutor",
  "specialization": "Mathematics",
  "contact_number": "+9876543210",
  "email": "tutor.test@example.com",
  "tutor_bio": "",
  "profile_image": null,
  "created_at": "2026-05-27T...",
  "updated_at": "2026-05-27T..."
}
```

---

## Test 8: Update Tutor Profile

**URL**: `PUT http://localhost:8000/api/tutor/me/profile/`

**Headers**:
```
Authorization: Bearer <tutor_access_token>
Content-Type: application/json
```

**Body**:
```json
{
  "tutor_name": "Updated Test Tutor",
  "specialization": "Advanced Mathematics",
  "contact_number": "+8888888888",
  "tutor_bio": "Expert in calculus and algebra"
}
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "tutor_name": "Updated Test Tutor",
  "specialization": "Advanced Mathematics",
  "contact_number": "+8888888888",
  "email": "tutor.test@example.com",
  "tutor_bio": "Expert in calculus and algebra",
  "profile_image": null,
  "created_at": "2026-05-27T...",
  "updated_at": "2026-05-27T... (updated)"
}
```

---

## Test 9: Error Handling - Duplicate Username

**URL**: `POST http://localhost:8000/api/auth/signup/`

**Body** (using existing username):
```json
{
  "username": "student_test_01",
  "password": "AnotherPass@123",
  "email": "different@example.com",
  "role": "student",
  "fullName": "Another Student"
}
```

**Expected Response** (400 Bad Request):
```json
{
  "errors": {
    "username": ["Username already exists"]
  }
}
```

---

## Test 10: Error Handling - Duplicate Email

**URL**: `POST http://localhost:8000/api/auth/signup/`

**Body** (using existing email):
```json
{
  "username": "different_username",
  "password": "AnotherPass@123",
  "email": "student.test@example.com",
  "role": "student",
  "fullName": "Another Student"
}
```

**Expected Response** (400 Bad Request):
```json
{
  "errors": {
    "email": ["Email already registered"]
  }
}
```

---

## Test 11: Error Handling - Invalid Credentials

**URL**: `POST http://localhost:8000/api/auth/login/`

**Body**:
```json
{
  "username": "student_test_01",
  "password": "WrongPassword"
}
```

**Expected Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

---

## Test 12: Error Handling - Missing Authorization

**URL**: `GET http://localhost:8000/api/student/me/profile/`

**Headers** (no Authorization header)

**Expected Response** (401 Unauthorized):
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## cURL Command Examples

### Signup Student
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "curl_student",
    "password": "CurlPass@123",
    "email": "curl.student@example.com",
    "role": "student",
    "fullName": "Curl Student",
    "phone": "+1111111111"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "curl_student",
    "password": "CurlPass@123"
  }' | jq -r '.access' > token.txt
```

### Get Profile
```bash
TOKEN=$(cat token.txt)
curl -X GET http://localhost:8000/api/student/me/profile/ \
  -H "Authorization: Bearer $TOKEN"
```

### Update Profile
```bash
TOKEN=$(cat token.txt)
curl -X PUT http://localhost:8000/api/student/me/profile/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "student_name": "Curl Student Updated",
    "bio": "Updated via cURL"
  }'
```

---

## Database Verification Queries

### Check all users
```sql
SELECT id, username, email FROM auth_user;
```

### Check student profiles
```sql
SELECT sp.id, sp.student_name, sp.email, sp.phone, sp.bio, u.username 
FROM student_studentprofile sp
JOIN auth_user u ON sp.user_id = u.id;
```

### Check tutor profiles
```sql
SELECT tp.id, tp.tutor_name, tp.email, tp.specialization, tp.contact_number, u.username 
FROM tutor_tutorprofile tp
JOIN auth_user u ON tp.user_id = u.id;
```

### Verify email sync
```sql
SELECT id, email FROM auth_user WHERE username = 'student_test_01';
SELECT email FROM student_studentprofile WHERE student_name = 'Updated Test Student';
```

---

## Troubleshooting

### "Invalid credentials" on login
- Verify username/email is correct
- Check password is correct (case-sensitive)
- Ensure user exists in auth_user table

### "Profile not found" on GET profile
- Verify student/tutor profile exists
- Check user_id in profile matches authenticated user

### Token validation errors
- Verify token hasn't expired
- Check token is complete (no truncation)
- Verify Authorization header format: `Bearer <token>`

### Database connection errors
- Check MySQL is running
- Verify credentials in settings.py
- Verify database 'lms' exists
- Run `python manage.py migrate`
