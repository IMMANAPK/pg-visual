import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function Login({ onSwitch, t }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🐘</span>
          <h1>PG Visual</h1>
          <p>{t?.loginSubtitle || 'Welcome back! Login to continue'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <span>❌</span> {error}
            </div>
          )}

          <div className="form-group">
            <label>{t?.email || 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>{t?.password || 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner small"></span>
                {t?.loggingIn || 'Logging in...'}
              </>
            ) : (
              t?.login || 'Login'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t?.noAccount || "Don't have an account?"}{' '}
            <button className="link-btn" onClick={onSwitch}>
              {t?.signupNow || 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
