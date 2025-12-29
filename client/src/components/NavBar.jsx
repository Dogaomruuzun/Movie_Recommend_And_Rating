import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import Icon from '../ui/Icon'
import { useTheme } from '../state/ThemeContext'
//This component is the NavBar (Navigation Bar) component, which allows the user to navigate within the application.
export default function NavBar() {
  const { user, logout } = useAuth() // Get user details
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/">Movie<span className="brand-accent">Rec</span></Link>
        <nav className="links">
          <Link to="/">Home</Link>
          {user && <Link to="/history">History</Link>}
          {user && <Link to="/profile">Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin"><Icon name="admin" /> Admin</Link>}
        </nav>
        <div className="nav-actions">
          <button className="ui-btn ui-btn--ghost" onClick={toggle} aria-label="Toggle theme">{theme === 'dark' ? 'Dark' : 'Light'}</button>
          {!user ? (
            <div className="nav-auth">
              <Link to="/login" className="ui-btn ui-btn--outline">Login</Link>
              <Link to="/register" className="ui-btn">Register</Link>
            </div>
          ) : (
            <div className="user-menu" role="menubar">
              <span className="avatar" aria-hidden>{user.name?.[0]?.toUpperCase() || 'U'}</span>
              <div className="user-dropdown">
                <div className="user-row">
                  <strong>{user.name}</strong>
                  <small className="muted">{user.email}</small>
                </div>
                <button onClick={handleLogout} role="menuitem" className="logout"><Icon name="logout" /> Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

