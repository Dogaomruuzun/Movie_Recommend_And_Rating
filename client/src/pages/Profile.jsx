import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import api from '../api'

// İki resmi de import ediyoruz
import heroBgDark from '../assets/hero-bg.jpg'
import heroBgLight from '../assets/hero-bg-light.jpg'

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  // Mevcut temayı hafızadan kontrol et
  const currentTheme = localStorage.getItem('siteTheme') || 'dark'

  // Temaya göre resim seç
  const bgImage = currentTheme === 'light' ? heroBgLight : heroBgDark

  // EDIT STATE
  const [editing, setEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!currentPassword) return alert('Please enter your current password to save changes.')

    try {
      const res = await api.put('/api/auth/me', {
        currentPassword,
        newName: newName || undefined,
        newPassword: newPassword || undefined
      })

      updateUser(res.data.user)
      alert('Profile updated successfully!')
      setEditing(false)
      setCurrentPassword('')
      setNewName('')
      setNewPassword('')
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed')
    }
  }

  if (!user) return null

  return (
    <div
      className="auth-page"
      style={{ backgroundImage: `url(${bgImage})` }} // Seçilen resmi kullan
    >
      <div className="auth-overlay" />

      {/* Profil Kartı */}
      <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'left' }}>

        {/* Üst Kısım: Başlık ve Kapat */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="auth-title" style={{ margin: 0, fontSize: '24px' }}>My Profile</h2>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#a7b6cc', cursor: 'pointer', fontSize: '14px' }}>
            ✕ Close
          </button>
        </div>

        {/* Avatar ve İsim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #243557' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c5cff, #22d3ee)',
            color: '#fff', fontSize: '28px', fontWeight: 'bold',
            display: 'grid', placeItems: 'center', boxShadow: '0 4px 15px rgba(124, 92, 255, 0.4)'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="auth-title" style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{user.name}</h3>
            <span className="auth-subtitle">Movie Fanatic</span>
          </div>
        </div>

        {/* Detaylar */}
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', color: '#7c5cff', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>EMAIL ADDRESS</label>
            <div className="auth-input" style={{ padding: '12px' }}>
              {user.email}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#7c5cff', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>MEMBERSHIP</label>
            <div className="auth-input" style={{ padding: '12px' }}>
              Standard User
            </div>
          </div>
        </div>

        {/* EDIT SECTION */}
        <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #243557' }}>
          {!editing ? (
            <button
              className="btn"
              style={{ width: '100%', background: '#7c5cff', color: '#fff' }}
              onClick={() => { setEditing(true); setNewName(user.name); }}
            >
              Update Profile
            </button>
          ) : (
            <form onSubmit={handleUpdate}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Edit Profile</h4>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', color: '#a7b6cc', fontSize: '12px', marginBottom: 5 }}>New Name</label>
                <input
                  className="auth-input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={user.name}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', color: '#a7b6cc', fontSize: '12px', marginBottom: 5 }}>New Password (optional)</label>
                <input
                  className="auth-input"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep same"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#ff4b4b', fontSize: '12px', marginBottom: 5 }}>Current Password (required)</label>
                <input
                  className="auth-input"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to confirm"
                  style={{ borderColor: '#ff4b4b' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn" style={{ flex: 1, background: '#7c5cff', color: '#fff' }}>Save Changes</button>
              </div>
            </form>
          )}
        </div>

        {/* Çıkış Butonu */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '30px', borderColor: '#ef4444', color: '#ef4444' }}
        >
          Sign Out
        </button>

      </div>
    </div>
  )
}