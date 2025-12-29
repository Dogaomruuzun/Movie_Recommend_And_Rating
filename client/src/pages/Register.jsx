import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import heroBg from '../assets/hero-bg.jpg'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError('Registration failed. Try again.')
    }
  }

  return (
    <div 
      className="auth-page" 
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="auth-overlay" />

      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the Movie World to create your lists</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="ui-error">{error}</div>}

          <input
            type="text"
            placeholder="Full Name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
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
            Register
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  )
}