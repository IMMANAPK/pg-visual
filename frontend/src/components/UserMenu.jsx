import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function UserMenu({ t }) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">
          {getInitials(user.name)}
        </div>
        <span>{user.name}</span>
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>

          <button className="dropdown-item">
            <span>⚙️</span>
            {t?.settings || 'Settings'}
          </button>

          <button className="dropdown-item">
            <span>📜</span>
            {t?.queryHistory || 'Query History'}
          </button>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item danger" onClick={logout}>
            <span>🚪</span>
            {t?.logout || 'Logout'}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
