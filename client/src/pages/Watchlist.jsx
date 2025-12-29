import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovies } from '../state/MovieContext' // Context'i çek
import api from '../api'
import LogWatchedModal from '../components/LogWatchedModal'
import { useAuth } from '../state/AuthContext'

export default function Watchlist() {
  const navigate = useNavigate()
  const { watchlist, removeFromWatchlist, addToHistory } = useMovies() // Canlı veriyi al
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [logMovie, setLogMovie] = useState(null)

  // New state for fresh rental data
  const [freshData, setFreshData] = useState({})

  React.useEffect(() => {
    // Load fresh statuses for rental info
    api.get('/api/movies').then(res => {
      const map = {}
      if (Array.isArray(res.data)) {
        res.data.forEach(m => { map[m.id] = m })
      }
      setFreshData(map)
    }).catch(() => { })
  }, [])

  const openQuickView = async (movie) => {
    setSelected(movie)
    setOpen(true)
    setDetails(null)
    const realId = Number(movie?.movieId ?? movie?.id)
    if (Number.isFinite(realId) && realId > 0 && realId <= 2147483647) {
      try {
        setLoading(true)
        const { data } = await api.get(`/api/movies/${realId}`)
        setDetails(data)
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back to Home</button>

      <div className="page-header">
        <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>My Watchlist</h2>
        <span style={{ color: '#6d7f97', fontSize: '14px' }}>{watchlist.length} films to watch</span>
      </div>

      <div className="poster-grid">
        {watchlist.map((localMovie) => {
          // Merge with fresh details if available to get rental status
          const fresh = freshData[localMovie.movieId] || {}
          const movie = { ...localMovie, ...fresh }

          const posterSrc = movie.poster || movie.poster_url || 'https://via.placeholder.com/300x450/1f2b55/ffffff?text=No+Poster'
          return (
            <div key={movie.id} className="poster-card" onClick={() => openQuickView(movie)}>
              <div className="poster-image" style={{ backgroundImage: `url(${posterSrc})` }} />
              <button
                className="btn btn-outline"
                style={{ position: 'absolute', top: 8, right: 8, padding: '6px 8px', fontSize: 12, zIndex: 2, background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
                onClick={(e) => { e.stopPropagation(); removeFromWatchlist(movie.id) }}
                title="Remove from Watchlist"
              >
                Remove
              </button>
              {(() => { const mid = Number(movie?.movieId ?? movie?.id); return Number.isFinite(mid) && mid > 0 && mid <= 2147483647 })() && (
                <button
                  className="btn btn-primary"
                  style={{ position: 'absolute', left: 8, top: 8, padding: '6px 8px', fontSize: 12, zIndex: 2 }}
                  onClick={(e) => { e.stopPropagation(); setLogMovie(movie); setLogOpen(true) }}
                  title="Log as watched"
                >
                  Watched
                </button>
              )}

              {/* RENTAL STATUS OVERLAY */}
              {!loading && (
                <div style={{ position: 'absolute', bottom: 60, left: 8, right: 8, zIndex: 3 }}>
                  {movie.rented_by ? (
                    movie.rented_by === user?.id ? (
                      <button className="btn" style={{ width: '100%', padding: '4px', fontSize: 11, background: '#ff4b4b', color: '#fff' }}
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (!window.confirm(`Return "${movie.title}"?`)) return
                          try {
                            const mid = movie.id || movie.movieId
                            await api.post(`/api/movies/${mid}/return`)

                            // 1. Update fresh data (UI update)
                            setFreshData(prev => ({ ...prev, [movie.movieId]: { ...prev[movie.movieId], rented_by: null } }))

                            // 2. Remove from Watchlist
                            removeFromWatchlist(mid)

                            // 3. Open Log Modal
                            setLogMovie(movie)
                            setLogOpen(true)

                          } catch (err) { alert('Return failed') }
                        }}
                      >Return</button>
                    ) : (
                      <div style={{ background: 'rgba(0,0,0,0.8)', color: '#a7b6cc', fontSize: 11, padding: '4px', textAlign: 'center', borderRadius: 4 }}>
                        Rented
                      </div>
                    )
                  ) : (
                    <button className="btn" style={{ width: '100%', padding: '4px', fontSize: 11, background: '#7c5cff', color: '#fff' }}
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!window.confirm(`Rent "${movie.title}"?`)) return
                        try {
                          const mid = movie.id || movie.movieId
                          await api.post(`/api/movies/${mid}/rent`)
                          setFreshData(prev => ({ ...prev, [movie.movieId]: { ...prev[movie.movieId], rented_by: user?.id } }))
                          alert('Movie rented!')
                        } catch (err) { alert('Rent failed') }
                      }}
                    >Rent</button>
                  )}
                </div>
              )}

              <div className="poster-info">
                <div className="poster-title">{movie.title}</div>
                <div className="poster-meta">{movie.year}</div>
              </div>
            </div>
          )
        })}
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)}>
          <div className="auth-card" style={{ maxWidth: 900, width: '92%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', right: 16, top: 16, background: 'transparent', border: 'none', color: '#a7b6cc', cursor: 'pointer', fontSize: 18 }}>✕</button>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ aspectRatio: '2 / 3', background: '#10131a' }}>
                  <img src={(details?.poster_url) || selected?.poster || selected?.poster_url || 'https://picsum.photos/seed/fallbackwatchlist/600/900'} alt={selected?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ margin: 0 }}>{details?.title || selected?.title}</h2>
                <div style={{ marginTop: 8, color: '#a7b6cc' }}>
                  {(details?.genre || selected?.genre || 'Unknown')} • {(details?.release_year || selected?.year || '')} {details ? `• ⭐ ${Number(details?.avg_rating || 0).toFixed(1)}` : ''}
                </div>
                {details?.genres?.length ? (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {details.genres.map((t) => (
                      <span key={t} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#c9bcff' }}>{t}</span>
                    ))}
                  </div>
                ) : null}
                <p style={{ marginTop: 12, lineHeight: 1.6, color: '#d7e0ef' }}>
                  {details?.description || 'No description available.'}
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-outline" onClick={() => { removeFromWatchlist(selected?.id); setOpen(false) }}>Remove</button>
                  <button className="btn" style={{ background: '#7c5cff', color: '#fff' }} onClick={() => setOpen(false)}>Close</button>
                </div>
                {loading && <div style={{ marginTop: 8, color: '#a7b6cc' }}>Loading details…</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <LogWatchedModal
        open={logOpen}
        movie={logMovie}
        onClose={() => { setLogOpen(false); setLogMovie(null) }}
        onLogged={({ movie, rating, review, date }) => {
          addToHistory(movie, rating, review, date)
          // Auto-remove from watchlist after logging
          removeFromWatchlist(movie)
        }}
      />
    </div>
  )
}
