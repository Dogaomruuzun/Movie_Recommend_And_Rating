import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovies } from '../state/MovieContext' 
import api from '../api'

import LogWatchedModal from '../components/LogWatchedModal'

export default function History() {
  const navigate = useNavigate()
  const { history, removeFromHistory, updateHistoryItem } = useMovies() 
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const openQuickView = async (movie) => {
    setSelected(movie)
    setOpen(true)
    setDetails(null)
    const realId = movie?.movieId || movie?.id
    if (realId && !isNaN(Number(realId))) {
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

  // A helper function that converts the score to stars.
  const renderStars = (rating) => "★".repeat(Math.floor(rating))

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back to Home</button>

      <div className="page-header">
        <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>Watch History</h2>
        <span style={{ color: '#6d7f97', fontSize: '14px' }}>Films you have watched recently</span>
      </div>

      <div className="poster-grid">
        {history.map((movie) => {
          const posterSrc = movie.poster || movie.poster_url || 'https://via.placeholder.com/300x450/1f2b55/ffffff?text=No+Poster'
          return (
            <div key={movie.id} className="poster-card" onClick={() => openQuickView(movie)}>
              <div className="poster-image" style={{ backgroundImage: `url(${posterSrc})` }} />
              <button
                className="btn btn-outline"
                style={{ position: 'absolute', top: 8, right: 8, padding: '6px 8px', fontSize: 12, zIndex: 2, background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
                onClick={async (e) => { e.stopPropagation(); await removeFromHistory(movie) }}
                title="Remove from History"
              >
                Remove
              </button>
              <div className="poster-info">
                <div className="poster-title">{movie.title}</div>
                <div className="poster-meta">
                  <span>{movie.date}</span>
                  <span className="rating-stars">{renderStars(movie.rating)}</span>
                </div>
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
                  <img src={(details?.poster_url) || selected?.poster || selected?.poster_url || 'https://picsum.photos/seed/fallbackhistory/600/900'} alt={selected?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>

              <div style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ margin: 0 }}>{details?.title || selected?.title}</h2>
                <div style={{ marginTop: 8, color: '#a7b6cc' }}>
                  {(details?.genre || selected?.genre || 'Unknown')} • {(details?.release_year || selected?.year || '')} {details ? `• Avg ⭐ ${Number(details?.avg_rating || 0).toFixed(1)}` : ''}
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

                {/* USER REVIEW SECTION */}
                <div style={{ marginTop: 20, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ color: '#fff' }}>Your Review</strong>
                    <button
                      onClick={() => setEditOpen(true)}
                      className="btn btn-outline"
                      style={{ padding: '4px 12px', fontSize: 12 }}
                    >
                      Edit Review
                    </button>
                  </div>
                  <div style={{ color: '#ffb4b4', marginBottom: 4 }}>
                    {renderStars(selected?.rating || 0)} <span style={{ color: '#a7b6cc', fontSize: 12 }}>({selected?.rating}/5)</span>
                  </div>
                  <div style={{ fontStyle: 'italic', color: '#d7e0ef' }}>
                    "{selected?.review || 'No written review'}"
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn" style={{ background: '#7c5cff', color: '#fff' }} onClick={() => setOpen(false)}>Close</button>
                </div>
                {loading && <div style={{ marginTop: 8, color: '#a7b6cc' }}>Loading details…</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      <LogWatchedModal
        open={editOpen}
        movie={selected}
        onClose={() => setEditOpen(false)}
        onLogged={({ movie, rating, review, date }) => {
          // Update local history item
          // selected is the local item so it has movieId
          updateHistoryItem(movie.movieId, { rating, review, date })
          // Update the selected view as well to reflect changes immediately
          setSelected(prev => ({ ...prev, rating, review, date }))
        }}
      />
    </div>
  )
}
