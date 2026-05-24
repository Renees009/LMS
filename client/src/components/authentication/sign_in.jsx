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

function makeFakeToken() {
  return `ui_token_${Math.random().toString(16).slice(2)}`
}

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    //  username and password must be the same.
    if (username !== password) {
      setError('Validation: username must be the same as password.')
      return
    }

    const accounts = loadAccounts()
    const account = accounts[username]

    if (!account || account.password !== password) {
      setError('Invalid username or password.')
      return
    }

    setLoading(true)
    setAuth({ token: makeFakeToken(), role: account.role })
    setLoading(false)

    if (account.role === 'student') window.location.href = '/student/explore'
    else window.location.href = '/tutor/courses'
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Sign In</h2>
      <form onSubmit={onSubmit}>
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

        {error ? (
          <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
        ) : null}

        <button disabled={loading} type="submit" style={{ padding: 10, width: '100%' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        No account? <a href="/signup">Sign up</a>
      </p>
    </div>
  )
}

