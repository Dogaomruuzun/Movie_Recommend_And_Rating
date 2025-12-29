import React, { useEffect, useState } from 'react'
import api from '../api'

export default function LogWatchedModal({ open, movie, onClose, onLogged }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setRating(movie?.rating || 0)
      setHoverRating(0)
      setReview(movie?.review || '')
      setDate(movie?.date || new Date().toISOString().split('T')[0])
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  if (!open || !movie) return null

  const movieId = Number(movie?.movieId ?? movie?.id)
  const validMovieId = Number.isFinite(movieId) && movieId > 0 && movieId <= 2147483647
  const canSubmit = validMovieId && rating >= 1 && rating <= 5 && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validMovieId) {
      setError('This item has no valid movie id; please pick from the list on Home.')
      return
    }
    if (!(rating >= 1 && rating <= 5)) {
      setError('Please select a rating (1–5).')
      return
    }
    try {
      setSubmitting(true)
      setError(null)
      await api.post(`/api/movies/${movieId}/ratings`, { rating, review })
      if (onLogged) onLogged({ movie, rating, review, date })
      onClose?.()
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Could not save rating'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="auth-card" style={{ maxWidth: 900, width: '92%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', right: 16, top: 16, background: 'transparent', border: 'none', color: '#a7b6cc', cursor: 'pointer', fontSize: 18 }}>✕</button>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ aspectRatio: '2 / 3', background: '#10131a' }}>
              <img src={movie.poster_url || movie.poster || 'https://picsum.photos/seed/fallbacklog/600/900'} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ margin: 0 }}>{movie.title}</h2>
            <div style={{ marginTop: 8, color: '#a7b6cc' }}>
              {(movie.genre || 'Unknown')} • {(movie.release_year || movie.year || '')}
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: 'rgba(255,0,0,0.08)', color: '#ffb4b4' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '6px' }}>DATE</label>
                <input type="date" className="auth-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '6px' }}>RATING</label>
                <div style={{ display: 'flex', gap: 6, height: 42, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ cursor: 'pointer', fontSize: 24, color: (hoverRating || rating) >= star ? '#7c5cff' : '#2c3440' }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ color: '#a7b6cc', fontSize: '12px', display: 'block', marginBottom: '6px' }}>REVIEW</label>
              <textarea className="auth-input" rows="4" placeholder="Write your thoughts..." style={{ resize: 'none' }} value={review} onChange={e => setReview(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button type="submit" className="btn" style={{ background: '#7c5cff', color: '#fff' }} disabled={!canSubmit}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
