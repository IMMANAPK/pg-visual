import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

function Signup({ onSwitch, t }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t?.passwordMismatch || 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError(t?.passwordTooShort || 'Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signup(email, password, name)
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
          <p>{t?.signupSubtitle || 'Create your account to get started'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <span>❌</span> {error}
            </div>
          )}

          <div className="form-group">
            <label>{t?.name || 'Name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>{t?.confirmPassword || 'Confirm Password'}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner small"></span>
                {t?.creatingAccount || 'Creating account...'}
              </>
            ) : (
              t?.signup || 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t?.haveAccount || 'Already have an account?'}{' '}
            <button className="link-btn" onClick={onSwitch}>
              {t?.loginNow || 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
