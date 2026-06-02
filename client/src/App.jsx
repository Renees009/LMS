import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import SignIn from "./components/authentication/SignIn";
import SignUp from "./components/authentication/SignUp";

import StudentLayout from "./components/student/IndexStudentLayout";
import StudentProfile from "./components/student/StudentProfile";
import ExploreCourse from "./components/student/ExploreCourse";
import EnrolledCourse from "./components/student/EnrolledCourse";
import CompletedCourse from "./components/student/CompletedCourse";
import Settings from "./components/student/StudentSettings";

import TutorCourse from "./components/tutor/TutorCourse";
import AddCourse from "./components/tutor/AddCourse";
import TutorProfile from "./components/tutor/TutorProfile";
import TutorSettings from "./components/tutor/TutorSettings";
import TutorLayout from "./components/tutor/IndexTutorLayout";
import ManageLessons from "./components/tutor/ManageLessons";
import ViewEnrollments from "./components/tutor/ViewEnrollments";


import { getRole, getToken } from "./auth/auth";

function RequireAuth({ children, role }) {
  const token = getToken();
  const userRole = getRole();


  if (!token) return <Navigate to="/signin" replace />;
  if (role && userRole !== role)
    return (
      <Navigate
        to={userRole === "tutor" ? "/tutor" : "/student"}
        replace
      />
    );

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

     
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/student"
          element={
            <RequireAuth role="student">
              <StudentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<ExploreCourse />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="explore" element={<ExploreCourse />} />
          <Route path="enrolled" element={<EnrolledCourse />} />
          <Route path="completed" element={<CompletedCourse />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/tutor"
          element={
            <RequireAuth role="tutor">
              <TutorLayout />
            </RequireAuth>
          }
        >
          <Route index element={<TutorCourse />} />
          <Route path="courses" element={<TutorCourse />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="manage-lessons" element={<ManageLessons />} />
          <Route path="enrollments" element={<ViewEnrollments />} />
          <Route path="profile" element={<TutorProfile />} />
          <Route path="settings" element={<TutorSettings />} />
        </Route>

          
        <Route path="/" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}