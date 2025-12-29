import { useEffect, useState } from 'react'
import api from '../api'
import Toast from '../components/Toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import Button from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'

export default function Admin() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('siteTheme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark')

  const [movies, setMovies] = useState([])
  const [users, setUsers] = useState([])
  const [activity, setActivity] = useState([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: 'Drama',
    release_year: new Date().getFullYear(),
    poster_url: '',
    genres: ''
  })

  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})

  async function load() {
    try {
      const [mRes, uRes, aRes] = await Promise.all([
        api.get('/api/movies'),
        api.get('/api/admin/users'),
        api.get('/api/admin/activity').catch(() => ({ data: [] })) 
      ])

      setMovies(Array.isArray(mRes.data) ? mRes.data : [])
      setUsers(Array.isArray(uRes.data) ? uRes.data : [])
      setActivity(Array.isArray(aRes.data) ? aRes.data : [])
    } catch (e) {
      setMessage(e.response?.data?.error || 'Admin data could not be loaded (are you logged in as admin?)')
    }
  }

  useEffect(() => { load() }, [])

  function updateField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function validate() {
    const er = {}
    if (!form.title || form.title.trim().length < 2) er.title = 'Title must be at least 2 characters'
    if (!form.description || form.description.trim().length < 20) er.description = 'Description must be at least 20 characters'

    const y = Number(form.release_year)
    const cur = new Date().getFullYear() + 1
    if (!(y >= 1888 && y <= cur)) er.release_year = `Year must be between 1888 and ${cur}`

    if (form.poster_url && !/^https?:\/\//i.test(form.poster_url)) er.poster_url = 'Poster URL must start with http(s)'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  async function addMovie(e) {
    e.preventDefault()
    if (!validate()) { setMessage('Please fix the form errors'); return }

    try {
      const { data: created } = await api.post('/api/movies', {
        title: form.title.trim(),
        description: form.description.trim(),
        genre: form.genre,
        release_year: Number(form.release_year),
        poster_url: form.poster_url.trim() || null,
      })

      const tags = form.genres.split(',').map(s => s.trim()).filter(Boolean)
      if (tags.length) {
        await api.put(`/api/movies/${created.id}/genres`, { genres: tags })
      }

      setForm({
        title: '',
        description: '',
        genre: 'Drama',
        release_year: new Date().getFullYear(),
        poster_url: '',
        genres: ''
      })

      await load()
      setMessage('Movie added')
    } catch (e) {
      setMessage(e.response?.data?.error || 'Could not add movie')
    }
  }

  async function deleteMovie(id) {
    if (!confirm('Delete this movie?')) return
    try {
      await api.delete(`/api/movies/${id}`)
      await load()
      setMessage('Movie deleted')
    } catch (e) {
      setMessage(e.response?.data?.error || 'Delete failed')
    }
  }

  async function toggleRole(u) {
    const role = u.role === 'admin' ? 'user' : 'admin'
    try {
      await api.put(`/api/admin/users/${u.id}`, { role })
      await load()
      setMessage('Role updated')
    } catch (e) {
      setMessage(e.response?.data?.error || 'Update failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">Movie<span className="brand-accent">Rec</span></Link>

          <div className="nav-links">
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/history" className="nav-item">History</Link>
            <Link to="/watchlist" className="nav-item">Watchlist</Link>
            <Link to="/profile" className="nav-item">Profile</Link>
            <Link to="/admin" className="nav-item" style={{ color: '#fff' }}>Admin</Link>
          </div>

          <span className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>

          <div className="auth-buttons">
            <div className="user-menu">
              <div onClick={logout} className="user-avatar" title="Logout">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container admin-page">
        <div className="page-header">
          <h2 style={{ margin: 0 }}>Admin Panel</h2>
          <span className="muted">Manage movies, users and activity</span>
        </div>

        <div className="grid two" style={{ marginTop: 20 }}>
          {/* MOVIES */}
          <section>
            <div className="row space-between">
              <h3>Movies</h3>
            </div>

            <form className="ui-card" onSubmit={addMovie} noValidate>
              <Input
                label="Title"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                error={errors.title}
              />

              <Textarea
                label="Description"
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                error={errors.description}
              />

              <div className="row">
                <Select
                  label="Genre"
                  value={form.genre}
                  onChange={e => updateField('genre', e.target.value)}
                >
                  <option>Action</option>
                  <option>Adventure</option>
                  <option>Animation</option>
                  <option>Comedy</option>
                  <option>Crime</option>
                  <option>Documentary</option>
                  <option>Drama</option>
                  <option>Family</option>
                  <option>Fantasy</option>
                  <option>Horror</option>
                  <option>Mystery</option>
                  <option>Romance</option>
                  <option>Sci-Fi</option>
                  <option>Thriller</option>
                  <option>War</option>
                  <option>Western</option>
                </Select>

                <Input
                  label="Year"
                  type="number"
                  value={form.release_year}
                  onChange={e => updateField('release_year', e.target.value)}
                  error={errors.release_year}
                />
              </div>

              <Input
                label="Poster URL"
                value={form.poster_url}
                onChange={e => updateField('poster_url', e.target.value)}
                error={errors.poster_url}
              />

              <Input
                label="Genres (comma separated)"
                placeholder="e.g. Drama, Romance"
                value={form.genres}
                onChange={e => updateField('genres', e.target.value)}
                hint={'First "Genre" is the primary category; tags add more.'}
              />

              <Button type="submit">Add Movie</Button>
            </form>

            <ul className="list">
              {movies.map(m => (
                <li key={m.id} className="row space-between ui-card">
                  <div>
                    <strong>{m.title}</strong>
                    <div className="meta small">
                      <span>{m.genre}</span> <span>{m.release_year}</span> <span>⭐ {Number(m.avg_rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <button className="ui-btn ui-btn--outline" onClick={() => deleteMovie(m.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>

          {/* USERS + ACTIVITY */}
          <section>
            <h3>Users</h3>
            <ul className="list">
              {users.map(u => (
                <li key={u.id} className="row space-between ui-card">
                  <div>
                    <strong>{u.name}</strong>
                    <div className="meta small">
                      <span>{u.email}</span> <span>role: {u.role}</span>
                    </div>
                  </div>
                  <button className="ui-btn" onClick={() => toggleRole(u)}>
                    {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 20 }}>
              <h3>Recent Activity (Last saved ratings)</h3>
              {activity.length === 0 ? (
                <p className="muted">No activity yet.</p>
              ) : (
                <ul className="list">
                  {activity.map(x => (
                    <li key={x.id} className="ui-card">
                      <div className="row space-between">
                        <strong>{x.user_name} ({x.email})</strong>
                        <span className="muted">{new Date(x.created_at).toLocaleString()}</span>
                      </div>
                      <div className="meta small">
                        <span>Movie: {x.movie_title}</span> &nbsp; | &nbsp; <span>⭐ {x.rating}</span>
                      </div>
                      {x.review ? <p style={{ marginTop: 8 }}>{x.review}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <Toast message={message} type="info" onClose={() => setMessage(null)} />
      </div>
    </div>
  )
}
