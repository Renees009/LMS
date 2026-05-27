# 🚀 Quick Start - Test Your Fixed Authentication System

## What Was Fixed

| Issue | Status |
|-------|--------|
| ❌ CORS blocking requests | ✅ FIXED - Enabled in Django |
| ❌ Sign Up missing email field | ✅ FIXED - Added and required |
| ❌ Sign In using wrong endpoint | ✅ FIXED - Now uses /api/auth/login/ |
| ❌ Missing error messages | ✅ FIXED - Detailed errors shown |
| ❌ Wrong form fields | ✅ FIXED - Matches backend exactly |

---

## Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd "c:\Users\acer\Desktop\personal projects\LMS\Server"
python manage.py runserver
```

**Expected Output:**
```
Watching for file changes with StatReloader
Quit the server with CTRL-BREAK.
Starting development server at http://127.0.0.1:8000/
```

✅ Server is ready when you see the "Starting development server" message

---

## Step 2: Start the Frontend

Open a NEW terminal and run:

```bash
cd "c:\Users\acer\Desktop\personal projects\LMS\client"
npm start
```

Or if using Vite:
```bash
npm run dev
```

**Expected Output:**
```
VITE ...
➜  Local:   http://localhost:5173/
```

✅ Frontend is ready when you see the local URL

---

## Step 3: Test Student Signup

1. **Open Browser** → `http://localhost:5173` (or 3000)
2. **Click Sign Up** → Student page should load
3. **Select Account Type:** Click **"Student"**
4. **Fill the Form:**
   ```
   Username:    test_student
   Password:    TestPass@123
   Email:       test_student@example.com  ⭐ NEW REQUIRED FIELD
   Full Name:   John Doe
   Phone:       +1234567890 (optional)
   ```
5. **Click "Create Account"**

### Expected Result ✅
- Success message: "Account created successfully"
- Page redirects to `/student/explore`
- **Open Browser Console (F12)** and see:
  ```
  Signup successful: { username: 'test_student', role: 'student' }
  ```

### Verify in MySQL
```sql
SELECT * FROM auth_user WHERE username = 'test_student';
SELECT * FROM student_studentprofile WHERE student_name = 'John Doe';
```

---

## Step 4: Test Student Login

1. **Go to Sign In** page
2. **Enter Credentials:**
   ```
   Username: test_student
   Password: TestPass@123
   ```
3. **Click "Sign In"**

### Expected Result ✅
- Success message: "Login successful"
- Page redirects to `/student/explore`
- **Open Browser Console (F12)** and see:
  ```
  Login successful: { username: 'test_student', role: 'student' }
  ```

---

## Step 5: Test Tutor Signup

1. **Go back to Sign Up**
2. **Select Account Type:** Click **"Tutor"**
3. **Fill the Form:**
   ```
   Username:           test_tutor
   Password:           TestPass@123
   Email:              test_tutor@example.com  ⭐ NEW REQUIRED FIELD
   Tutor Name:         Jane Smith
   Specialization:     Mathematics (optional)
   Contact Number:     +9876543210 (optional)
   ```
4. **Click "Create Account"**

### Expected Result ✅
- Success message: "Account created successfully"
- Page redirects to `/tutor/courses`
- **Browser Console** shows:
  ```
  Signup successful: { username: 'test_tutor', role: 'tutor' }
  ```

---

## Step 6: Test Tutor Login

1. **Go to Sign In**
2. **Enter:**
   ```
   Username: test_tutor
   Password: TestPass@123
   ```
3. **Click "Sign In"**

### Expected Result ✅
- Success message: "Login successful"
- Page redirects to `/tutor/courses`
- **Browser Console** shows:
  ```
  Login successful: { username: 'test_tutor', role: 'tutor' }
  ```

---

## Step 7: Test Error Cases

### Test 7.1: Duplicate Username
1. Try signup with username: `test_student` (already exists)
2. Different email: `newemail@example.com`
3. **Click "Create Account"**

**Expected Error:** "Username already exists"

---

### Test 7.2: Duplicate Email
1. Username: `another_user`
2. Email: `test_student@example.com` (already exists)
3. **Click "Create Account"**

**Expected Error:** "Email already registered"

---

### Test 7.3: Invalid Email Format
1. Username: `newuser`
2. Email: `notanemail` (missing @)
3. **Click "Create Account"**

**Expected Error:** "Invalid email format"

---

### Test 7.4: Wrong Password
1. Go to Sign In
2. Username: `test_student`
3. Password: `WrongPassword`
4. **Click "Sign In"**

**Expected Error:** "Invalid credentials"

---

## Verify Tokens Are Stored

1. **Open Browser DevTools** (F12)
2. **Go to Application tab** (or Storage)
3. **Click Local Storage** → `http://localhost:5173` (or 3000)
4. **You should see:**
   ```
   lms_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   lms_role:  student (or tutor)
   ```

✅ Tokens are properly stored!

---

## Debugging with Browser Console

### Access Console
- Press **F12** or Right-click → **Inspect** → **Console tab**

### What You'll See

**Successful Signup:**
```javascript
Signup successful: {
  username: 'test_student',
  role: 'student'
}
```

**Successful Login:**
```javascript
Login successful: {
  username: 'test_student', 
  role: 'student'
}
```

**Error During Signup:**
```javascript
Signup error: {
  errors: {
    email: ["Email already registered"]
  }
}
```

**Network Error:**
```javascript
Signup request error: Error: Failed to fetch
(This means Django server is not running!)
```

---

## Troubleshooting

### Issue: "Network error" on signup/login
**Solution:**
1. Check Django server is running (Terminal 1)
2. Verify it says "Starting development server..."
3. Restart Django: Press CTRL+C then run again

### Issue: Stuck on signup page (nothing happens)
**Solution:**
1. **Open Browser Console (F12)**
2. Look for error messages
3. Most likely: Django not running or CORS issue
4. Restart both servers

### Issue: "Email already registered" on first signup
**Solution:**
- Email might exist from previous test
- Use different email: `test_student_02@example.com`
- Or clear database and start fresh

### Issue: Signup succeeds but redirects to wrong page
**Solution:**
- Check localStorage `lms_role` value (should be "student" or "tutor")
- Check browser console for role in message
- If role is wrong, check /api/auth/login/ endpoint returns it

### Issue: "CORS error" in browser console
**Solution:**
- Django CORS not enabled properly
- Restart Django server
- Check that `corsheaders` is in INSTALLED_APPS
- Check CorsMiddleware is in MIDDLEWARE (before SessionMiddleware)

---

## Complete Testing Checklist

- [ ] Django server starts without errors
- [ ] Frontend loads (no 404 errors)
- [ ] Student signup works
- [ ] Tokens saved in localStorage
- [ ] Redirects to correct page
- [ ] Student login works
- [ ] Tutor signup works
- [ ] Tutor login works
- [ ] Error messages display properly
- [ ] Duplicate username shows error
- [ ] Duplicate email shows error
- [ ] Wrong password shows error
- [ ] Browser console shows correct messages
- [ ] MySQL has user and profile data

---

## Database Verification

Open MySQL and check data was created:

```sql
-- Connect to database
USE lms;

-- Check users
SELECT id, username, email FROM auth_user;

-- Check student profiles
SELECT sp.id, sp.student_name, sp.email, sp.phone, u.username 
FROM student_studentprofile sp
JOIN auth_user u ON sp.user_id = u.id;

-- Check tutor profiles
SELECT tp.id, tp.tutor_name, tp.email, tp.specialization, u.username 
FROM tutor_tutorprofile tp
JOIN auth_user u ON tp.user_id = u.id;
```

---

## Key Points

✅ **Email is now REQUIRED** - Add to all signup forms

✅ **Sign In uses** `/api/auth/login/` - Not `/api/auth/token/`

✅ **Check console (F12)** - See all signup/login messages

✅ **Phone is optional** - But shown in form

✅ **Role determines redirect** - Student → explore, Tutor → courses

---

## After Successful Testing

Next steps:
1. ✅ Test GET /api/student/me/profile/
2. ✅ Test PUT /api/student/me/profile/
3. ✅ Test course enrollment endpoints
4. ✅ Test other authenticated API calls

---

## Need Help?

Check these documents for details:
- **AUTHENTICATION_FIX.md** - Complete testing guide with examples
- **API_INTEGRATION_REFERENCE.md** - API endpoint details
- **FIXES_SUMMARY.md** - What was changed and why

---

**You're all set! Your authentication system is now working! 🎉**

Start the servers and test it out!
