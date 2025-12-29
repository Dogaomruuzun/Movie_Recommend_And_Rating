import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import heroBg from '../assets/hero-bg.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div 
      className="auth-page" 
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="auth-overlay" />

      <div className="auth-card">

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Enter your credentials to access your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="ui-error">{error}</div>}
          
          <input
            type="email"
            placeholder="Email Address"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '14px'}}>
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  )
}