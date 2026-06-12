# LMS - Learning Management System - FLOW LEARN HUB

A full-stack Learning Management System (LMS) designed to facilitate online education. This platform supports two primary user roles: **Tutors**, who can create and manage courses, and **Students**, who can enroll in courses, track their progress, and take quizzes.

## 🚀 Features

### For Students
*   **Course Exploration:** Browse and view details of available courses.
*   **Enrollment System:**  enroll in courses to access restricted content.
*   **Quiz System:** Attempt quizzes upon completing 80% of a course, with automated grading and re-attempt .

### For Tutors
*   **Course Creation:** create courses with titles, categories, levels, and descriptions.
*   **Lesson Management:** Upload video content and PDF materials for each lesson.

### For Admin
*   **Profile Creation:** Create, Delete, Update Tutor and Student Profiles.
*   **Course , Lesson , Quiz management:** Create, Delete, Update course, lesson, and quiz details.

## 🛠️ Technology Stack

### Backend (Server)
*   **Framework:** Django & Django REST Framework (DRF)
*   **Authentication:** JWT 
*   **Database:** MySQL 

*   **Storage:** Default Django storage for thumbnails and course materials

### Frontend (Client)
*   **Library:** React.js (Vite)
*   **UI Framework:** Ant Design (Antd)
*   **Routing:** React Router DOM
*   **Icons:** Ant Design Icons

## 📦 Installation & Setup

### Prerequisites
*   Python 3.8+
*   Node.js & npm
*   MySQL Server

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd Server
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your database settings in `settings.py`.
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create a `.env` file and set your API URL:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Launch the development server:
   ```bash
   npm run dev
   ```

