# Frontend-Backend API Integration - Quick Reference

## Overview
This document shows the exact API requests and responses for authentication.

---

## 1. Student Signup

### Frontend Request
```javascript
POST http://localhost:8000/api/auth/signup/
Content-Type: application/json

{
  "username": "john_student",
  "password": "SecurePass@123",
  "email": "john@example.com",        // ⭐ REQUIRED (was missing)
  "role": "student",
  "fullName": "John Doe",
  "phone": "+1234567890"              // Optional (was "studentId")
}
```

### Backend Response (201 Created)
```json
{
  "id": 1,
  "username": "john_student",
  "email": "john@example.com",
  "role": "student",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Frontend Action
- Store in localStorage: `lms_token = access`, `lms_role = "student"`
- Show success message
- Redirect to: `/student/explore`

### Database Impact
```sql
-- Created in auth_user table
INSERT INTO auth_user (username, email, password) 
VALUES ('john_student', 'john@example.com', 'hashed_password');

-- Created in student_studentprofile table
INSERT INTO student_studentprofile (user_id, student_name, email, phone) 
VALUES (1, 'John Doe', 'john@example.com', '+1234567890');
```

---

## 2. Tutor Signup

### Frontend Request
```javascript
POST http://localhost:8000/api/auth/signup/
Content-Type: application/json

{
  "username": "jane_tutor",
  "password": "SecurePass@123",
  "email": "jane@example.com",        // ⭐ REQUIRED (was missing)
  "role": "tutor",
  "tutorName": "Jane Smith",
  "specialization": "Mathematics",    // Optional
  "contactNumber": "+9876543210"      // Optional (was missing)
}
```

### Backend Response (201 Created)
```json
{
  "id": 2,
  "username": "jane_tutor",
  "email": "jane@example.com",
  "role": "tutor",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Frontend Action
- Store in localStorage: `lms_token = access`, `lms_role = "tutor"`
- Show success message
- Redirect to: `/tutor/courses`

### Database Impact
```sql
-- Created in auth_user table
INSERT INTO auth_user (username, email, password) 
VALUES ('jane_tutor', 'jane@example.com', 'hashed_password');

-- Created in tutor_tutorprofile table
INSERT INTO tutor_tutorprofile (user_id, tutor_name, email, specialization, contact_number) 
VALUES (2, 'Jane Smith', 'jane@example.com', 'Mathematics', '+9876543210');
```

---

## 3. Student/Tutor Login

### Frontend Request
```javascript
POST http://localhost:8000/api/auth/login/    // ⭐ CHANGED (was /api/auth/token/)
Content-Type: application/json

{
  "username": "john_student",
  "password": "SecurePass@123"
}
```

### Backend Response (200 OK)
```json
{
  "id": 1,
  "username": "john_student",
  "email": "john@example.com",
  "role": "student",                  // ⭐ NOW INCLUDED (was missing)
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Frontend Action
- Store in localStorage: `lms_token = access`, `lms_role = role`
- Show success message
- Redirect based on role:
  - If `role === "student"` → `/student/explore`
  - If `role === "tutor"` → `/tutor/courses`

---

## 4. Get Student Profile

### Frontend Request
```javascript
GET http://localhost:8000/api/student/me/profile/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend Response (200 OK)
```json
{
  "id": 1,
  "student_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "bio": "",
  "created_at": "2026-05-27T10:30:00Z",
  "updated_at": "2026-05-27T10:30:00Z"
}
```

---

## 5. Update Student Profile

### Frontend Request
```javascript
PUT http://localhost:8000/api/student/me/profile/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "student_name": "John Updated",
  "email": "newemail@example.com",
  "phone": "+9876543210",
  "bio": "Updated bio"
}
```

### Backend Response (200 OK)
```json
{
  "id": 1,
  "student_name": "John Updated",
  "email": "newemail@example.com",
  "phone": "+9876543210",
  "bio": "Updated bio",
  "created_at": "2026-05-27T10:30:00Z",
  "updated_at": "2026-05-27T11:45:00Z"
}
```

---

## Error Responses

### 1. Duplicate Username (400 Bad Request)
```json
{
  "errors": {
    "username": ["Username already exists"]
  }
}
```

### 2. Duplicate Email (400 Bad Request)
```json
{
  "errors": {
    "email": ["Email already registered"]
  }
}
```

### 3. Invalid Email Format (400 Bad Request)
```json
{
  "errors": {
    "email": ["Enter a valid email address."]
  }
}
```

### 4. Invalid Credentials (401 Unauthorized)
```json
{
  "error": "Invalid credentials"
}
```

### 5. Missing Authorization Header (401 Unauthorized)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 6. Invalid Token (401 Unauthorized)
```json
{
  "detail": "Given token is invalid for any token type"
}
```

---

## Key Changes from Frontend Side

### sign_up.jsx Changes
| Feature | Before | After |
|---------|--------|-------|
| Email field | ❌ Missing | ✅ Added (required) |
| Phone field (students) | ❌ Was "studentId" | ✅ Changed to "phone" |
| Contact field (tutors) | ❌ Missing | ✅ Added "contactNumber" |
| Error handling | ⚠️ Basic | ✅ Detailed with field-specific errors |
| Console logging | ❌ None | ✅ Added for debugging |

### sign_in.jsx Changes
| Feature | Before | After |
|---------|--------|-------|
| Endpoint | `/api/auth/token/` | ✅ `/api/auth/login/` |
| Role in response | ❌ Missing (defaulted to student) | ✅ Included from backend |
| Error handling | ⚠️ Basic | ✅ Detailed error messages |
| Console logging | ❌ None | ✅ Added for debugging |

---

## Key Changes from Backend Side

### Authentication Views

#### SignupView
- ✅ Validates unique username AND email
- ✅ Returns role in response
- ✅ Creates appropriate profile based on role
- ✅ All data persists to MySQL

#### LoginView (NEW)
- ✅ Accepts username or email
- ✅ Authenticates against Django User
- ✅ Returns role determined from profile
- ✅ Proper error handling

### CORS Configuration
- ✅ Enabled django-cors-headers
- ✅ Added CorsMiddleware (correct position in stack)
- ✅ Configured allowed origins for localhost:3000 and 5173
- ✅ Enabled credentials for authenticated requests

---

## Testing Checklist

### Signup Testing
- [ ] Student signup with all fields
- [ ] Tutor signup with all fields
- [ ] Signup with duplicate username → Error shown
- [ ] Signup with duplicate email → Error shown
- [ ] Signup with invalid email format → Error shown
- [ ] Check MySQL for created user and profile
- [ ] Verify tokens stored in localStorage

### Login Testing
- [ ] Login with username (student)
- [ ] Login with username (tutor)
- [ ] Login with email instead of username
- [ ] Login with wrong password → Error shown
- [ ] Login redirects to correct page based on role
- [ ] Verify tokens stored in localStorage
- [ ] Check browser console for role information

### API Testing
- [ ] Get own profile (requires auth token)
- [ ] Update own profile (requires auth token)
- [ ] Token refresh still works
- [ ] Expired token properly rejected

---

## CORS Details

### What Changed
```python
# Before
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
# ]

# After
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React default port
    "http://localhost:5173",      # Vite dev server
    "http://127.0.0.1:3000",      # Alternative localhost
    "http://127.0.0.1:5173",      # Alternative Vite
]

CORS_ALLOW_CREDENTIALS = True     # Allow cookies/tokens
```

### Middleware Position
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ✅ Added (correct position)
    'django.contrib.sessions.middleware.SessionMiddleware',
    # ... rest of middleware
]
```

---

## Quick Debugging Commands

### Check Django is running
```bash
curl http://localhost:8000/api/courses/
```

### Test signup directly
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "TestPass@123",
    "email": "test@example.com",
    "role": "student",
    "fullName": "Test User"
  }'
```

### Test login directly
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "TestPass@123"
  }'
```

### Check MySQL users
```sql
USE lms;
SELECT username, email FROM auth_user;
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Network error" on signup | CORS blocked | Check Django CORS config, restart server |
| "Email already registered" | Email exists | Use different email or clear DB |
| Redirected to wrong page | Role not returned | Check /api/auth/login/ endpoint returns role |
| Token not saved | localStorage issue | Check browser storage, verify token is returned |
| Form validation fails | Missing required fields | Ensure all required fields are filled |
| "Invalid email format" | Format validation | Check email format is user@example.com |

