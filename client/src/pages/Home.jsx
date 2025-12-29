import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useMovies } from '../state/MovieContext'
import api from '../api'
import LogWatchedModal from '../components/LogWatchedModal'


import heroBgDark from '../assets/hero-bg.jpg'
import heroBgLight from '../assets/hero-bg-light.jpg'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { addToWatchlist, addToHistory, removeFromWatchlist, history } = useMovies()
  const [logOpen, setLogOpen] = useState(false)
  const [logMovie, setLogMovie] = useState(null)

  const [theme, setTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark')

  // MODAL state
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('watchlist')

 //form data
  const [movieName, setMovieName] = useState('')
  const [rating, setRating] = useState(0) 
  const [review, setReview] = useState('')
  const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0])

  // Hover efekti için (Yıldızların üstüne gelince yanması için)
  const [hoverRating, setHoverRating] = useState(0)

  // HERO INFO MODAL STATE
  const [heroOpen, setHeroOpen] = useState(false)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('siteTheme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark')
  const currentHeroImage = theme === 'dark' ? heroBgDark : heroBgLight
  // --- MOVIE LIST STATE ---
  const [movies, setMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [moviesError, setMoviesError] = useState(null)

  // Genre Preference Calculation
  const genreScores = React.useMemo(() => {
    if (!history || !history.length) return {}
    const sums = {}
    const counts = {}

    history.forEach(h => {
      // Try to find genre from history item or fallback to movie list
      let g = h.genre
      if (!g) {
        const m = movies.find(mv => String(mv.id) === String(h.movieId))
        g = m?.genre
      }
      //"Unknown" genres shouldn't skew preferences
      if (g && g !== 'Unknown') {
        const key = String(g).trim() // Normalize
        sums[key] = (sums[key] || 0) + Number(h.rating)
        counts[key] = (counts[key] || 0) + 1
      }
    })

    const scores = {}
    Object.keys(sums).forEach(g => {
      const avg = sums[g] / counts[g]
      if (avg > 3.5) {
        scores[g] = avg
      }
    })
    return scores
  }, [history, movies])

  // filtre/search
  const [q, setQ] = useState('')
  const [genreFilter, setGenreFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recommended') // recommended | newest | rating | year

  useEffect(() => {
    let alive = true

    async function loadMovies() {
      try {
        setLoadingMovies(true)
        setMoviesError(null)

        // 1) Normal endpoint
        let res
        try {
          res = await api.get('/api/movies')
        } catch (err) {
         
          if (err?.response?.status === 404) {
            res = await api.get('/movies')
          } else {
            throw err
          }
        }

        if (!alive) return
        const data = res?.data
        setMovies(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!alive) return
        const status = e?.response?.status
        const msg = e?.response?.data?.error || e?.message
        console.error('MOVIES ERROR:', { status, msg, data: e?.response?.data })
        setMoviesError(`Movies could not be loaded. (${status || 'NETWORK'}) ${msg || ''}`)
      } finally {
        if (!alive) return
        setLoadingMovies(false)
      }
    }

    loadMovies()
    return () => { alive = false }
  }, [])



  // SAVE FUNCTION
  const handleSave = (e) => {
    e.preventDefault()
    if (!movieName) return alert("Please enter a movie name")

    if (activeTab === 'watchlist') {
      const added = addToWatchlist(movieName)
      alert(added ? `${movieName} added to Watchlist!` : `${movieName} is already in your Watchlist`)
    } else {
      if (rating === 0) return alert("Please rate the movie")
      addToHistory(movieName, rating, review, watchDate)
      alert(`${movieName} logged to History!`)
    }

    // Temizlik ve Kapatma
    setMovieName('')
    setReview('')
    setRating(0)
    setShowModal(false)
  }

  // --- RENDER MOVIE CARD ---
  const renderMovieCard = (m) => (
    <div key={m.id} style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)'
    }}
      onClick={() => navigate(`/movie/${m.id}`)}
    >
      <div style={{ aspectRatio: '2 / 3', background: '#10131a' }}>
        <img
          src={m.poster_url || 'https://picsum.photos/seed/fallback/400/600'}
          alt={m.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2, color: theme === 'dark' ? '#e0e0e0' : 'inherit' }}>
          {m.title}
        </div>

        <div style={{ marginTop: 6, fontSize: 12, color: '#a7b6cc' }}>
          {m.genre} • {m.release_year} • ⭐ {Number(m.avg_rating || 0).toFixed(1)}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {user && (
            <button
              className="btn"
              style={{ padding: '8px 12px', fontSize: 12, background: '#7c5cff', color: '#fff' }}
              onClick={(e) => {
                e.stopPropagation()
                const added = addToWatchlist(m)
                alert(added ? `${m.title} added to Watchlist!` : `${m.title} is already in your Watchlist`)
              }}
            >
              + Watchlist
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className="btn btn-outline"
              style={{ padding: '8px 12px', fontSize: 12 }}
              onClick={(e) => { e.stopPropagation(); setLogMovie(m); setLogOpen(true) }}
            >
              Watched
            </button>
          )}
        </div>

        {/* RENTAL UI */}
        {user && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {m.rented_by ? (
              m.rented_by === user.id ? (
                <button
                  className="btn"
                  style={{ width: '100%', background: '#ff4b4b', color: '#fff', fontSize: 13, padding: '8px' }}
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!window.confirm(`Return "${m.title}"?`)) return
                    try {
                      await api.post(`/api/movies/${m.id}/return`)

                      // 1. Remove from Watchlist
                      removeFromWatchlist(m)

                      // 2. Open Log Modal
                      setLogMovie(m)
                      setLogOpen(true)

                      // 3. Update local state
                      setMovies(prev => prev.map(p => p.id === m.id ? { ...p, rented_by: null } : p))
                      // alert('Movie returned successfully') // Alert removed to make flow smoother
                    } catch (err) {
                      alert(err.response?.data?.error || 'Return failed')
                    }
                  }}
                >
                  Return Movie
                </button>
              ) : (
                <div style={{ padding: '8px', fontSize: 13, background: 'rgba(255,255,255,0.05)', color: '#a7b6cc', textAlign: 'center', borderRadius: 8 }}>
                  Unavailable (Rented)
                </div>
              )
            ) : (
              <button
                className="btn"
                style={{ width: '100%', background: 'rgba(124, 92, 255, 0.1)', color: '#aab', fontSize: 13, padding: '8px', border: '1px solid rgba(124, 92, 255, 0.3)' }}
                onClick={async (e) => {
                  e.stopPropagation()
                  if (!window.confirm(`Rent "${m.title}"?`)) return
                  try {
                    const { data } = await api.post(`/api/movies/${m.id}/rent`)
                    setMovies(prev => prev.map(p => p.id === m.id ? { ...p, rented_by: user.id } : p))
                    alert('Movie rented successfully!')
                  } catch (err) {
                    alert(err.response?.data?.error || 'Rent failed')
                  }
                }}
              >
                Rent Movie
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="home">

      {/* ──────────────── NAVBAR ──────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">Movie<span className="brand-accent">Rec</span></Link>

          {user && (
            <div className="nav-links">
              <Link to="/" className="nav-item">Home</Link>
              <Link to="/history" className="nav-item">History</Link>
              <Link to="/watchlist" className="nav-item">Watchlist</Link>
              <Link to="/profile" className="nav-item">Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-item">Admin</Link>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 15 }}>
            <span className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </span>

            {/* LOG BUTTON (Admin) */}


            {/* USER AVATAR (LOGOUT) */}
            {user ? (
              <div
                className="user-menu"
                onClick={logout}
                title="Logout"
                style={{ cursor: 'pointer' }}
              >
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ marginLeft: '10px' }}>Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className="hero-banner">
        <div className="hero-bg" style={{ backgroundImage: `url(${currentHeroImage})` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Movie World</h1>
          <p className="hero-desc">Log films you've watched. Save films to watch later.</p>
          <button className="btn btn-outline" style={{ marginTop: '10px' }} onClick={() => setHeroOpen(true)}>More Info</button>
        </div>
      </section>
      {/* ──────────────── MOVIE LIST (DB) ──────────────── */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ width: 'min(1100px, 92%)', margin: '0 auto' }}>

          {/* RENTAL MOVIES SECTION */}
          {user && movies.some(m => m.rented_by === user.id) && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ margin: 0, fontSize: '22px', color: theme === 'dark' ? '#e0e0e0' : '#ff4b4b' }}>Rental Movies</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16,
                marginTop: 10
              }}>
                {movies
                  .filter(m => m.rented_by === user.id)
                  .map(renderMovieCard)
                }
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />
            </div>
          )}

          <h2 style={{ margin: 0, fontSize: '22px', color: theme === 'dark' ? '#e0e0e0' : 'inherit' }}>Browse Movies</h2>


          {/* Controls */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap',
            marginTop: 18, marginBottom: 18
          }}>
            <input
              className="auth-input"
              placeholder="Search title..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ maxWidth: 320 }}
            />

            <select
              className="auth-input"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{ maxWidth: 220 }}
            >
              <option value="All">All genres</option>
              {[...new Set(movies.map(m => m.genre).filter(Boolean))].sort().map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              className="auth-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ maxWidth: 220 }}
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="newest">Sort: Newest</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="year">Sort: Release Year</option>
            </select>
          </div>

          {/* States */}
          {loadingMovies && (
            <div style={{ padding: 20, color: '#a7b6cc' }}>Loading movies...</div>
          )}

          {moviesError && (
            <div style={{
              padding: 16, borderRadius: 12,
              background: 'rgba(255,0,0,0.08)', color: '#ffb4b4'
            }}>
              {moviesError}
            </div>
          )}

          {!loadingMovies && !moviesError && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              marginTop: 10
            }}>
              {movies
                .filter(m => {
                  const okGenre = genreFilter === 'All' || m.genre === genreFilter
                  const okQ = !q || String(m.title || '').toLowerCase().includes(q.toLowerCase())
                  // Filter out if already in history
                  const isWatched = history.some(h => String(h.movieId) === String(m.id))
                  return okGenre && okQ && !isWatched
                })
                .sort((a, b) => {
                  if (sortBy === 'recommended') {
                    const gA = String(a.genre || '').trim()
                    const gB = String(b.genre || '').trim()
                    const scoreA = genreScores[gA] || 0
                    const scoreB = genreScores[gB] || 0
                    if (scoreA !== scoreB) return scoreB - scoreA // Sort by genre preference
                    // Tie-breaker: Global rating
                    return Number(b.avg_rating) - Number(a.avg_rating)
                  }
                  if (sortBy === 'rating') return Number(b.avg_rating) - Number(a.avg_rating)
                  if (sortBy === 'year') return Number(b.release_year) - Number(a.release_year)
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                })
                .map(renderMovieCard)}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────── LOG MODAL (POPUP) ──────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="auth-card" style={{ maxWidth: '450px', width: '90%', textAlign: 'left', position: 'relative' }}>

            {/* Kapat Tuşu */}
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', right: 20, top: 20, background: 'transparent', border: 'none', color: '#a7b6cc', cursor: 'pointer', fontSize: '18px' }}
            >✕</button>

            <h2 className="auth-title" style={{ fontSize: '22px', marginBottom: '20px' }}>Log a Movie</h2>

            {/* Sekmeler */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #2c3440', paddingBottom: '10px' }}>

              <button
                onClick={() => setActiveTab('log')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px',
                  color: activeTab === 'log' ? '#7c5cff' : '#a7b6cc',
                  fontWeight: activeTab === 'log' ? 'bold' : 'normal',
                  padding: 0
                }}
              >
                Add to History
              </button>

              <button
                onClick={() => setActiveTab('watchlist')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px',
                  color: activeTab === 'watchlist' ? '#7c5cff' : '#a7b6cc',
                  fontWeight: activeTab === 'watchlist' ? 'bold' : 'normal',
                  padding: 0
                }}
              >
                Add to Watchlist
              </button>


            </div>

            <form onSubmit={handleSave} className="auth-form">
              {/* Film Adı */}
              <div>
                <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '5px' }}>NAME OF FILM</label>
                <input
                  type="text" className="auth-input" placeholder="Enter movie title..."
                  value={movieName} onChange={e => setMovieName(e.target.value)} autoFocus
                />
              </div>

              {/* Sadece LOG sekmesi seçiliyse gösterilecek alanlar */}
              {activeTab === 'log' && (
                <>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '5px' }}>DATE</label>
                      <input
                        type="date" className="auth-input"
                        value={watchDate} onChange={e => setWatchDate(e.target.value)}
                      />
                    </div>

                    {/* YILDIZLI PUANLAMA ALANI */}
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '5px' }}>RATING</label>
                      <div style={{ display: 'flex', gap: '5px', height: '42px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              cursor: 'pointer',
                              fontSize: '24px',
                              // Eğer mouse üstündeyse (hover) veya kalıcı olarak seçildiyse (rating) Mor olsun
                              color: (hoverRating || rating) >= star ? '#7c5cff' : '#2c3440',
                              transition: 'color 0.2s'
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '5px' }}>REVIEW</label>
                    <textarea
                      className="auth-input" rows="3" placeholder="Add a review..."
                      style={{ resize: 'none' }}
                      value={review} onChange={e => setReview(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                type="submit" className="btn"
                style={{
                  marginTop: '15px', width: '100%',
                  background: '#7c5cff',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(124, 92, 255, 0.4)'
                }}
              >
                {activeTab === 'watchlist' ? 'Add to Watchlist' : 'Save to Diary'}
              </button>

            </form>
          </div>
        </div>
      )}

      <LogWatchedModal
        open={logOpen}
        movie={logMovie}
        onClose={() => { setLogOpen(false); setLogMovie(null) }}
        onLogged={({ movie, rating, review, date }) => {
          addToHistory(movie, rating, review, date)
          // Auto-remove from watchlist if present
          removeFromWatchlist(movie)
          alert('Saved to history and ratings!')
        }}
      />

      {/* DEBUG UI */}
      {user?.role === 'admin' && (
        <div style={{ padding: '20px', background: '#111', color: '#0f0', fontFamily: 'monospace', fontSize: 12 }}>
          <h4>DEBUG: Recommendations</h4>
          <pre>{JSON.stringify(genreScores, null, 2)}</pre>
        </div>
      )}

      {/* HERO MORE INFO MODAL */}
      {heroOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setHeroOpen(false)}>
          <div className="auth-card" style={{ maxWidth: 900, width: '92%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setHeroOpen(false)} style={{ position: 'absolute', right: 16, top: 16, background: 'transparent', border: 'none', color: '#a7b6cc', cursor: 'pointer', fontSize: 18 }}>✕</button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: 16, alignItems: 'start' }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ aspectRatio: '2 / 3', background: '#10131a' }}>
                  <img src={currentHeroImage} alt="Movie World" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ margin: 0 }}>Movie World</h2>
                <div style={{ marginTop: 8, color: '#a7b6cc' }}>
                  Web Platform • 2025 • ⭐ 5.0
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#c9bcff' }}>React</span>
                  <span style={{ fontSize: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#c9bcff' }}>Node.js</span>
                  <span style={{ fontSize: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#c9bcff' }}>MySQL</span>
                </div>
                <p style={{ marginTop: 12, lineHeight: 1.6, color: '#d7e0ef' }}>
                  Welcome to <strong>Movie World</strong>, the ultimate platform for movie enthusiasts!
                  <br /><br />
                  Log every film you watch, rate them, and build your personal history.
                  Our smart recommendation engine analyzes your taste to suggest the best movies for you.
                  Create your watchlist, manage your profile, and explore a vast database of films with a modern, responsive interface.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn" style={{ background: '#7c5cff', color: '#fff' }} onClick={() => setHeroOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
