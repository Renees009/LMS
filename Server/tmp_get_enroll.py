import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
from course.models import Course
from student.models import StudentProfile, StudentCourseEnrollment
from rest_framework_simplejwt.tokens import RefreshToken
User = get_user_model()
user = User.objects.get(username='copilot_test_user')
profile, _ = StudentProfile.objects.get_or_create(user=user, defaults={'student_name': user.username})
course, _ = Course.objects.get_or_create(title='Test Course', defaults={'category':'Test','duration':1,'level':'Beginner','description':'Test course description'})
StudentCourseEnrollment.objects.get_or_create(student_profile=profile, course=course)
refresh = RefreshToken.for_user(user)
access = str(refresh.access_token)
from django.test import Client
c = Client(HTTP_HOST='localhost', HTTP_AUTHORIZATION=f'Bearer {access}')
r = c.get('/api/me/enrollments/')
content = r.content.decode('utf-8', errors='replace')
output = f'status {r.status_code}\n{content[:1000]}'
with open('debug_enroll_output.txt', 'w', encoding='utf-8') as f:
    f.write(output)
