# LMS Authentication & Profile Management API Documentation

## Overview
This document outlines the complete authentication and user profile management system for the LMS platform. The system stores user credentials and profile details in both Django ORM and MySQL database, with full support for two user types: **Students** and **Tutors**.

## Database Architecture

### User Credentials Storage
- **Table**: `auth_user` (Django built-in)
- **Fields**: `id`, `username`, `email`, `password` (hashed)
- **Purpose**: Stores login credentials securely

### Student Profile Storage  
- **Table**: `student_studentprofile`
- **Fields**: 
  - `id`: Primary key
  - `user_id`: Foreign key to auth_user
  - `student_name`: Full name of student
  - `email`: Email address
  - `phone`: Contact number
  - `bio`: Biography/about section
  - `profile_image`: Profile picture (optional)
  - `created_at`: Account creation timestamp
  - `updated_at`: Last update timestamp

### Tutor Profile Storage
- **Table**: `tutor_tutorprofile`
- **Fields**:
  - `id`: Primary key
  - `user_id`: Foreign key to auth_user
  - `tutor_name`: Full name of tutor
  - `email`: Email address
  - `specialization`: Area of expertise
  - `contact_number`: Contact number
  - `tutor_bio`: Biography
  - `profile_image`: Profile picture (optional)
  - `created_at`: Account creation timestamp
  - `updated_at`: Last update timestamp

## API Endpoints

### 1. User Registration (Signup)
**Endpoint**: `POST /api/auth/signup/`

**Request Body**:
```json
{
  "username": "john_student",
  "password": "SecurePassword123",
  "email": "john@example.com",
  "role": "student",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

Or for tutor:
```json
{
  "username": "jane_tutor",
  "password": "SecurePassword123",
  "email": "jane@example.com",
  "role": "tutor",
  "tutorName": "Jane Smith",
  "specialization": "Mathematics",
  "contactNumber": "+9876543210"
}
```

**Response** (201 Created):
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

**What Happens**:
1. Validates username is unique
2. Validates email is unique
3. Creates Django User with hashed password (stored in `auth_user` table)
4. Creates StudentProfile or TutorProfile with provided details (stored in respective tables)
5. Returns JWT tokens for immediate authentication
6. Both credentials and profile are persisted to MySQL

---

### 2. User Login (Signin)
**Endpoint**: `POST /api/auth/login/`

**Request Body**:
```json
{
  "username": "john_student",
  "password": "SecurePassword123"
}
```

Or use email as username:
```json
{
  "username": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
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

**Error Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

**What Happens**:
1. Authenticates user against Django User table
2. Verifies password using Django's secure hashing
3. Determines user role by checking StudentProfile or TutorProfile existence
4. Generates JWT tokens
5. No data modifications, read-only operation

---

### 3. Get Student Profile
**Endpoint**: `GET /api/student/me/profile/`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "student_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "bio": "I love learning",
  "created_at": "2026-05-27T10:30:00Z",
  "updated_at": "2026-05-27T10:30:00Z"
}
```

---

### 4. Update Student Profile
**Endpoint**: `PUT /api/student/me/profile/`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "student_name": "John Updated",
  "email": "newemail@example.com",
  "phone": "+9876543210",
  "bio": "Updated bio"
}
```

**Response** (200 OK):
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

**What Happens**:
1. Validates JWT token from Authorization header
2. Retrieves student's profile from database
3. Updates provided fields
4. Syncs email changes to Django User table
5. Persists changes to MySQL
6. Returns updated profile

---

### 5. Get Tutor Profile
**Endpoint**: `GET /api/tutor/me/profile/`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "tutor_name": "Jane Smith",
  "email": "jane@example.com",
  "specialization": "Mathematics",
  "contact_number": "+9876543210",
  "tutor_bio": "Expert in calculus",
  "profile_image": "/media/tutor_profiles/jane.jpg",
  "created_at": "2026-05-27T10:30:00Z",
  "updated_at": "2026-05-27T10:30:00Z"
}
```

---

### 6. Update Tutor Profile
**Endpoint**: `PUT /api/tutor/me/profile/` or `PATCH /api/tutor/me/profile/`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "tutor_name": "Jane Updated",
  "email": "newemail@example.com",
  "specialization": "Advanced Mathematics",
  "contact_number": "+1111111111",
  "tutor_bio": "Expert in calculus and algebra"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "tutor_name": "Jane Updated",
  "email": "newemail@example.com",
  "specialization": "Advanced Mathematics",
  "contact_number": "+1111111111",
  "tutor_bio": "Expert in calculus and algebra",
  "profile_image": "/media/tutor_profiles/jane.jpg",
  "created_at": "2026-05-27T10:30:00Z",
  "updated_at": "2026-05-27T11:45:00Z"
}
```

---

### 7. Token Refresh
**Endpoint**: `POST /api/auth/token/refresh/`

**Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Authentication Flow

### Registration Flow
```
1. Client sends signup request with credentials and role
   ↓
2. Backend validates unique username and email
   ↓
3. Backend creates Django User (auth_user table)
   ↓
4. Backend creates StudentProfile or TutorProfile
   ↓
5. Both records persisted to MySQL
   ↓
6. JWT tokens generated and returned to client
   ↓
7. Client stores tokens and uses access token for authenticated requests
```

### Login Flow
```
1. Client sends login request with username/email and password
   ↓
2. Backend authenticates against Django User
   ↓
3. Backend determines user role
   ↓
4. JWT tokens generated
   ↓
5. Tokens returned to client
   ↓
6. Client uses access token for authenticated requests
```

### Profile Update Flow
```
1. Client sends update request with Authorization header (JWT token)
   ↓
2. Backend validates token
   ↓
3. Backend retrieves user's profile from database
   ↓
4. Backend updates provided fields
   ↓
5. Changes persisted to MySQL
   ↓
6. Updated profile returned to client
```

## Database Persistence

**All data is automatically persisted to MySQL through Django ORM:**

- User credentials stored in `auth_user` table
- Student profiles stored in `student_studentprofile` table
- Tutor profiles stored in `tutor_tutorprofile` table
- Foreign key relationships maintained automatically
- Timestamps managed by Django (auto_now, auto_now_add)

**Database Configuration** (in `backend/settings.py`):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'lms',
        'USER': 'root',
        'PASSWORD': 'Pilot@009',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

## Error Handling

### Common Errors

| Status | Error Message | Cause |
|--------|---------------|-------|
| 400 | "Username already exists" | Username taken during signup |
| 400 | "Email already registered" | Email taken during signup |
| 400 | Invalid credentials | Missing required fields |
| 401 | "Invalid credentials" | Wrong password during login |
| 404 | "Profile not found" | User doesn't have a profile |
| 500 | Server error | Unexpected server issue |

## JWT Token Details

- **Payload**: Contains user ID, username, email
- **Expiration**: Configurable (default: 5 minutes for access, longer for refresh)
- **Signing**: Uses SECRET_KEY from Django settings
- **Usage**: Add to Authorization header as `Bearer <token>`

## Security Features

1. **Password Hashing**: Django uses PBKDF2 algorithm for password hashing
2. **CSRF Protection**: Enabled for session-based requests
3. **JWT Validation**: Tokens validated on each authenticated request
4. **Email Validation**: Email format validated during signup
5. **Unique Constraints**: Username and email uniqueness enforced at database level

## Testing Endpoints

### Using cURL

**Signup as Student**:
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "SecurePass123",
    "email": "student1@example.com",
    "role": "student",
    "fullName": "Student One",
    "phone": "+1234567890"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "SecurePass123"
  }'
```

**Get Student Profile** (replace with actual token):
```bash
curl -X GET http://localhost:8000/api/student/me/profile/ \
  -H "Authorization: Bearer <access_token>"
```

**Update Student Profile**:
```bash
curl -X PUT http://localhost:8000/api/student/me/profile/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "student_name": "Updated Name",
    "phone": "+9876543210"
  }'
```

## Notes

- Access tokens should be stored securely on the client (e.g., httpOnly cookies)
- Implement token refresh before expiration
- Use HTTPS in production
- Update SECRET_KEY in production
- Never commit database credentials to version control
