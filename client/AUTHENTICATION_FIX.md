# Frontend Authentication Fix - Complete Guide

## Issues Fixed ✅

### 1. **CORS Not Enabled** 
   - **Problem**: Django backend was blocking requests from React frontend
   - **Solution**: Installed and configured `django-cors-headers`
   - **Added**: CORS middleware and allowed origins for localhost:3000 and localhost:5173

### 2. **Sign Up Missing Email Field**
   - **Problem**: Backend requires `email` but frontend form didn't have it
   - **Solution**: Added required email field to signup form with validation
   - **Impact**: Users can now provide email during registration

### 3. **Sign In Using Wrong Endpoint**
   - **Problem**: Using `/api/auth/token/` (SimplJWT) which doesn't return role
   - **Solution**: Changed to `/api/auth/login/` endpoint we created
   - **Impact**: Login now properly returns user role for correct routing

### 4. **Missing Error Handling & Logging**
   - **Problem**: No visibility into why requests were failing
   - **Solution**: Added console.log statements and detailed error messages
   - **Impact**: Users and developers can see errors in browser console

### 5. **Form Fields Mismatch**
   - **Problem**: Frontend fields didn't match backend requirements
   - **Solution**: Updated to match backend serializer expectations:
     - Added `phone` for students (instead of studentId)
     - Added `contactNumber` for tutors
     - Made email required for all users

---

## Files Modified

### Backend
- **`backend/settings.py`**
  - Added `corsheaders` to INSTALLED_APPS
  - Added CorsMiddleware to MIDDLEWARE (positioned correctly)
  - Configured CORS_ALLOWED_ORIGINS for development
  - Enabled CORS_ALLOW_CREDENTIALS

### Frontend
- **`src/components/authentication/sign_up.jsx`**
  - Added email field (required)
  - Replaced studentId with phone field
  - Added contactNumber field for tutors
  - Improved error handling with detailed error messages
  - Added console logging for debugging
  - Updated form values extraction to include new fields

- **`src/components/authentication/sign_in.jsx`**
  - Changed endpoint from `/api/auth/token/` to `/api/auth/login/`
  - Proper role handling from response
  - Added console logging
  - Improved error handling and validation
  - Better fallback routing

---

## Testing Steps

### Step 1: Start Django Server
```bash
cd "c:\Users\acer\Desktop\personal projects\LMS\Server"
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Step 2: Start React Frontend
```bash
cd "c:\Users\acer\Desktop\personal projects\LMS\client"
npm start
# or if using Vite:
npm run dev
```

### Step 3: Test Student Signup
1. Go to **Sign Up** page
2. Select **Student** account type
3. Fill in the form:
   - Username: `test_student_01`
   - Password: `TestPass@123`
   - Email: `teststudent@example.com` ⭐ (NEW - REQUIRED)
   - Full Name: `Test Student`
   - Phone: `+1234567890` (optional)

4. Click **Create Account**

**Expected Result**:
- ✅ See success message: "Account created successfully"
- ✅ Redirected to `/student/explore`
- ✅ Check browser console - should see: `Signup successful: { username: 'test_student_01', role: 'student' }`

**Verify in MySQL**:
```sql
SELECT id, username, email FROM auth_user WHERE username = 'test_student_01';
SELECT id, student_name, email, phone FROM student_studentprofile WHERE student_name = 'Test Student';
```

---

### Step 4: Test Tutor Signup
1. Go to **Sign Up** page
2. Select **Tutor** account type
3. Fill in the form:
   - Username: `test_tutor_01`
   - Password: `TestPass@123`
   - Email: `testtutor@example.com` ⭐ (NEW - REQUIRED)
   - Tutor Name: `Test Tutor`
   - Specialization: `Mathematics` (optional)
   - Contact Number: `+9876543210` (optional)

4. Click **Create Account**

**Expected Result**:
- ✅ See success message: "Account created successfully"
- ✅ Redirected to `/tutor/courses`
- ✅ Browser console shows: `Signup successful: { username: 'test_tutor_01', role: 'tutor' }`

---

### Step 5: Test Student Login
1. Go to **Sign In** page
2. Enter credentials:
   - Username: `test_student_01`
   - Password: `TestPass@123`

3. Click **Sign In**

**Expected Result**:
- ✅ See success message: "Login successful"
- ✅ Redirected to `/student/explore`
- ✅ Browser console shows: `Login successful: { username: 'test_student_01', role: 'student' }`
- ✅ Token stored in localStorage under key `lms_token`
- ✅ Role stored in localStorage under key `lms_role`

---

### Step 6: Test Tutor Login
1. Go to **Sign In** page
2. Enter credentials:
   - Username: `test_tutor_01`
   - Password: `TestPass@123`

3. Click **Sign In**

**Expected Result**:
- ✅ See success message: "Login successful"
- ✅ Redirected to `/tutor/courses`
- ✅ Browser console shows: `Login successful: { username: 'test_tutor_01', role: 'tutor' }`

---

### Step 7: Test Error Cases

#### Test 7a: Duplicate Username
1. Try to signup with existing username: `test_student_01`
2. Different email: `another@example.com`

**Expected Error**:
```
Username already exists
```

#### Test 7b: Duplicate Email
1. Try to signup with new username: `newuser`
2. Existing email: `teststudent@example.com`

**Expected Error**:
```
Email already registered
```

#### Test 7c: Invalid Login
1. Username: `test_student_01`
2. Password: `WrongPassword`

**Expected Error**:
```
Invalid credentials
```

#### Test 7d: Invalid Email Format
1. On signup form, try email: `notanemail`
2. Click Create Account

**Expected Error**:
```
Invalid email format
```

---

## Debugging in Browser Console

Open browser DevTools (F12) and check the Console tab for helpful messages:

### Successful Signup
```javascript
Signup successful: {
  username: 'test_student_01',
  role: 'student'
}
```

### Successful Login
```javascript
Login successful: {
  username: 'test_student_01',
  role: 'student'
}
```

### Signup Error
```javascript
Signup error: {
  errors: {
    email: ["Email already registered"]
  }
}
```

### Network Error
```javascript
Signup request error: Error: Failed to fetch
```

---

## CORS Configuration Details

The backend now accepts requests from:
- `http://localhost:3000` (default React port)
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:3000` (alternative localhost)
- `http://127.0.0.1:5173` (alternative Vite)

**If you need to add more origins**, edit `backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    # Add more here
]
```

---

## LocalStorage Verification

After successful login, verify tokens are stored:

**Open browser DevTools** → Application/Storage → Local Storage:
- `lms_token`: Should contain the JWT access token
- `lms_role`: Should be either "student" or "tutor"

---

## Complete API Flow

```
User clicks "Sign Up"
        ↓
Frontend validates form fields
        ↓
Browser checks CORS (✓ Allowed from localhost:3000)
        ↓
POST /api/auth/signup/ with:
{
  "username": "test_student_01",
  "password": "TestPass@123",
  "email": "teststudent@example.com",
  "role": "student",
  "fullName": "Test Student",
  "phone": "+1234567890"
}
        ↓
Backend validates data
        ↓
Creates auth_user (credentials)
Creates student_studentprofile (profile)
        ↓
Both saved to MySQL
        ↓
Returns:
{
  "id": 1,
  "username": "test_student_01",
  "email": "teststudent@example.com",
  "role": "student",
  "access": "eyJ...",
  "refresh": "eyJ..."
}
        ↓
Frontend stores token and role
        ↓
Success message shown
        ↓
User redirected to /student/explore
```

---

## Troubleshooting

### Issue: "Network error" message
**Solution**:
1. Check if Django server is running: `python manage.py runserver`
2. Check if CORS is enabled (look in console for CORS errors)
3. Verify API_BASE URL is correct: `http://localhost:8000`
4. Check browser console for detailed error message

### Issue: "Invalid email format" even with valid email
**Solution**:
- Make sure email field is filled before clicking Create Account
- Check email follows standard format: `user@example.com`

### Issue: Stuck on signup page after clicking Create Account
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab to see if request was sent
5. Verify Django server is running and responsive

### Issue: Redirected to wrong page after login
**Solution**:
1. Check localStorage `lms_role` value
2. Verify role is returned correctly from backend
3. Check browser console for role value in login message

### Issue: "Email already registered" but first time signing up
**Solution**:
1. Email might already exist in database
2. Check MySQL for existing email:
   ```sql
   SELECT * FROM auth_user WHERE email = 'teststudent@example.com';
   ```
3. Use different email or clear database if testing fresh

---

## Database Queries

### Check all registered users
```sql
SELECT id, username, email FROM auth_user;
```

### Check student profiles
```sql
SELECT sp.id, sp.student_name, sp.email, sp.phone, u.username 
FROM student_studentprofile sp
JOIN auth_user u ON sp.user_id = u.id;
```

### Check tutor profiles
```sql
SELECT tp.id, tp.tutor_name, tp.email, tp.specialization, u.username 
FROM tutor_tutorprofile tp
JOIN auth_user u ON tp.user_id = u.id;
```

---

## Next Steps

After confirming authentication is working:
1. ✅ Test profile update endpoints
2. ✅ Test course enrollment
3. ✅ Test other API endpoints with authentication
4. ✅ Add password reset functionality
5. ✅ Implement email verification (optional)
6. ✅ Add remember me functionality (optional)
