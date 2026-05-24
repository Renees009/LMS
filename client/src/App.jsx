import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './components/authentication/sign_in'
import SignUp from './components/authentication/sign_up'
import ExploreCourse from './components/student/explore_course'
import TutorCourse from './components/tutor/tutor_course'
import { getRole, getToken } from './auth/auth'

function RequireAuth({ children, role }) {
  const token = getToken()
  const userRole = getRole()

  if (!token) return <Navigate to="/signin" replace />
  if (role && userRole !== role) return <Navigate to={userRole === 'tutor' ? '/tutor/courses' : '/student/explore'} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/student/explore"
          element={
            <RequireAuth role="student">
              <ExploreCourse />
            </RequireAuth>
          }
        />
        <Route
          path="/tutor/courses"
          element={
            <RequireAuth role="tutor">
              <TutorCourse />
            </RequireAuth>
          }
        />

        <Route path="/" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

