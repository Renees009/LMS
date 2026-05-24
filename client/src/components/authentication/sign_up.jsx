import { useState } from 'react'
import { apiPost, setAuth } from '../../auth/auth'

export default function SignUp() {
  const [accountType, setAccountType] = useState('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Student fields
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')

  // Tutor fields
  const [tutorName, setTutorName] = useState('')
  const [specialization, setSpecialization] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    // Basic validation per role
    if (accountType === 'student' && !fullName) {
      setError('Student full name is required.')
      return
    }
    if (accountType === 'tutor' && !tutorName) {
      setError('Tutor name is required.')
      return
    }

    const payload = {
      accountType,
      username,
      password,
    }

    if (accountType === 'student') {
      payload.full_name = fullName
      payload.student_id = studentId
    } else {
      payload.tutor_name = tutorName
      payload.specialization = specialization
    }

    setLoading(true)
    try {
      const data = await apiPost('/signup', payload)
      // expected: { token, role }
      setAuth({ token: data?.token, role: data?.role || accountType })
    } catch (err) {
      setError(err?.message || 'Sign up failed')
      setLoading(false)
      return
    }

    if (accountType === 'student') window.location.href = '/student/explore'
    else window.location.href = '/tutor/courses'
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>Sign Up</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Account type</label>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <label>
              <input
                type="radio"
                checked={accountType === 'student'}
                onChange={() => setAccountType('student')}
              />{' '}
              Student
            </label>
            <label>
              <input
                type="radio"
                checked={accountType === 'tutor'}
                onChange={() => setAccountType('tutor')}
              />{' '}
              Tutor
            </label>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {accountType === 'student' ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                style={{ width: '100%', padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Student ID (optional)</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                type="text"
                style={{ width: '100%', padding: 8 }}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>Tutor name</label>
              <input
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                type="text"
                style={{ width: '100%', padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Specialization (optional)</label>
              <input
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                type="text"
                style={{ width: '100%', padding: 8 }}
              />
            </div>
          </>
        )}

        {error ? (
          <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
        ) : null}

        <button disabled={loading} type="submit" style={{ padding: 10, width: '100%' }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/signin">Sign in</a>
      </p>
    </div>
  )
}

