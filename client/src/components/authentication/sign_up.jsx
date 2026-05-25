import { useState } from 'react'
import { setAuth } from '../../auth/auth'

const ACCOUNTS_KEY = 'lms_accounts_v1'

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAccounts(next) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next))
}

function makeFakeToken() {
  
  return `ui_token_${Math.random().toString(16).slice(2)}`
}

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

    if (username !== password) {
      setError('Username or Password is incorrect')
      return
    }

    if (accountType === 'student' && !fullName) {
      setError('Student full name is required.')
      return
    }
    if (accountType === 'tutor' && !tutorName) {
      setError('Tutor name is required.')
      return
    }

    const accounts = loadAccounts()
    if (accounts[username]) {
      setError('An account with this username already exists.')
      return
    }

    const profile = { fullName, studentId, tutorName, specialization }

    accounts[username] = {
      username,
      password, 
      role: accountType,
      ...profile,
      createdAt: Date.now(),
    }

    setLoading(true)
    saveAccounts(accounts)

    
    setAuth({ token: makeFakeToken(), role: accountType })
    setLoading(false)

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

