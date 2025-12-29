import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import api from '../api'

const NS = 'mr:v1'
const MovieContext = createContext()

function safeParse(json) {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}

function normTitle(s) { return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase() }
function dedupKey(m) {
  const id = m?.movieId ?? m?.id
  if (id != null && !Number.isNaN(Number(id))) return `id:${Number(id)}`
  const t = normTitle(m?.title)
  const y = m?.release_year ?? m?.year ?? ''
  return `t:${t}|${y}`
}

export function MovieProvider({ children }) {
  const { user } = useAuth()

  const profileKey = useMemo(() => {
    const uid = user?.id ? String(user.id) : 'guest'
    const mail = user?.email ? String(user.email).toLowerCase() : 'guest'
    return `${uid}:${mail}`
  }, [user?.id, user?.email])

  const watchlistKey = useMemo(() => `${NS}:watchlist:${profileKey}`, [profileKey])
  const historyKey = useMemo(() => `${NS}:history:${profileKey}`, [profileKey])

  const hydrated = useRef(false)

  // Initialize from storage for the current profile
  const [watchlist, setWatchlist] = useState(() => safeParse(localStorage.getItem(watchlistKey)))
  const [history, setHistory] = useState(() => safeParse(localStorage.getItem(historyKey)))

  // On key change (user switched), hydrate first then allow writes
  useEffect(() => {
    const w = safeParse(localStorage.getItem(watchlistKey))
    const h = safeParse(localStorage.getItem(historyKey))
    setWatchlist(w)
    setHistory(h)
    hydrated.current = true

    // Auto-heal broken watchlist/history items (missing metadata but have valid ID)
    const healList = async (list, setter) => {
      if (!Array.isArray(list)) return
      let changed = false
      const updates = [...list]

      for (let i = 0; i < updates.length; i++) {
        const item = updates[i]
        // Heal if missing genre or poster
        if (!item.genre || !item.poster_url) {
          const mid = item.movieId || (Number.isFinite(Number(item.id)) && item.id < 2000000000 ? item.id : null)
          if (mid) {
            try {
              const { data } = await api.get(`/api/movies/${mid}`)
              if (data) {
                updates[i] = {
                  ...item,
                  movieId: mid,
                  title: data.title,
                  year: String(data.release_year),
                  poster_url: data.poster_url,
                  poster: data.poster_url || data.poster || item.poster,
                  description: data.description,
                  genre: data.genre,
                  avg_rating: data.avg_rating,
                }
                changed = true
              }
            } catch (e) { }
          }
        }
      }
      if (changed) setter(updates)
    }

    healList(w, setWatchlist)
    healList(h, setHistory)
  }, [watchlistKey, historyKey])

  // Persist after hydration
  useEffect(() => {
    if (!hydrated.current) return
    localStorage.setItem(watchlistKey, JSON.stringify(watchlist))
  }, [watchlist, watchlistKey])
  useEffect(() => {
    if (!hydrated.current) return
    localStorage.setItem(historyKey, JSON.stringify(history))
  }, [history, historyKey])

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === watchlistKey) setWatchlist(safeParse(e.newValue))
      if (e.key === historyKey) setHistory(safeParse(e.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [watchlistKey, historyKey])

  // Add to Watchlist (string title or movie object)
  const addToWatchlist = (movieOrTitle) => {
    const isString = typeof movieOrTitle === 'string'
    const m = isString ? { title: movieOrTitle } : (movieOrTitle || {})

    // Ensure we keep all important metadata
    const item = {
      id: m.id ?? Date.now(),
      movieId: m.id,
      title: m.title || '',
      year: String(m.release_year ?? m.year ?? ''),
      poster_url: m.poster_url || m.poster,
      poster: m.poster || m.poster_url || 'https://via.placeholder.com/300x450/1f2b55/ffffff?text=No+Poster',
      description: m.description,
      genre: m.genre,
      avg_rating: m.avg_rating,
    }
    const key = dedupKey(item)
    const exists = watchlist.some((w) => dedupKey(w) === key)
    if (exists) return false
    setWatchlist((prev) => [{ ...item }, ...prev])
    return true
  }

  // Add to History (string title or movie object)
  const addToHistory = (movieOrTitle, rating, review, date) => {
    const isString = typeof movieOrTitle === 'string'
    const m = isString ? { title: movieOrTitle } : (movieOrTitle || {})
    const title = m.title || ''
    const posterSrc = m.poster || m.poster_url || `https://via.placeholder.com/300x450/1f2b55/ffffff?text=${encodeURIComponent(title || 'No+Poster')}`

    // Ensure we keep all important metadata
    const item = {
      id: Date.now(), // local card id
      movieId: m.id,
      title,
      rating: Number(rating),
      review: review,
      date: date || new Date().toISOString().split('T')[0],
      poster: posterSrc,
      poster_url: m.poster_url || m.poster,
      year: m.release_year ?? m.year,
      description: m.description,
      genre: m.genre,
      avg_rating: m.avg_rating,
    }
    setHistory((prev) => [item, ...prev])
  }

  const removeFromWatchlist = (idOrMovie) => {
    const key = typeof idOrMovie === 'object' ? dedupKey(idOrMovie) : null
    setWatchlist((prev) => prev.filter((m) => {
      if (key) return dedupKey(m) !== key
      return String(m.id) !== String(idOrMovie)
    }))
  }

  const updateHistoryItem = (movieId, updates) => {
    setHistory(prev => prev.map(item => {
      if (String(item.movieId) === String(movieId)) {
        return { ...item, ...updates }
      }
      return item
    }))
  }

  const removeFromHistory = async (idOrItem) => {
    const isObj = typeof idOrItem === 'object' && idOrItem !== null
    const localId = isObj ? idOrItem.id : idOrItem
    let movieId = isObj ? (idOrItem.movieId) : undefined
    if (!movieId) {
      const found = history.find((m) => String(m.id) === String(localId))
      movieId = found?.movieId
    }

    const numId = Number(movieId)
    if (Number.isFinite(numId) && numId > 0 && numId <= 2147483647) {
      try {
        await api.delete(`/api/movies/${numId}/ratings/me`)
      } catch (e) {
        console.warn('Could not delete rating on server:', e?.response?.data || e?.message || e)
      }
    }

    setHistory((prev) => prev.filter((m) => String(m.id) !== String(localId)))
  }

  return (
    <MovieContext.Provider value={{
      watchlist,
      history,
      addToWatchlist,
      addToHistory,
      removeFromWatchlist,
      removeFromHistory,
      updateHistoryItem,
    }}>
      {children}
    </MovieContext.Provider>
  )
}

export const useMovies = () => useContext(MovieContext)
