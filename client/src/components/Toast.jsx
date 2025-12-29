import { useEffect } from 'react'
// This component displays a short toast notification to inform the user of an event (e.g., success, error).
export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onClose?.(), 3000)
    return () => clearTimeout(t) 
  }, [message]) // The effect runs again when the 'message' changes.
  if (!message) return null
  return (
    <div className={`toast ${type}`} role="status" aria-live="polite">{message}</div>
  )
}
