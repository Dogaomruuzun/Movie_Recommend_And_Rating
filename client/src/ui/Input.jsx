import React from 'react'

export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <label className={`ui-field ${className}`}>
      {label && <span className="ui-label">{label}</span>}
      <input className={`ui-input ${error ? 'is-invalid' : ''}`} {...props} />
      {hint && !error && <small className="ui-hint">{hint}</small>}
      {error && <small className="ui-error" role="alert">{error}</small>}
    </label>
  )
}

export function Select({ label, hint, error, className = '', children, ...props }) {
  return (
    <label className={`ui-field ${className}`}>
      {label && <span className="ui-label">{label}</span>}
      <select className={`ui-input ui-select ${error ? 'is-invalid' : ''}`} {...props}>
        {children}
      </select>
      {hint && !error && <small className="ui-hint">{hint}</small>}
      {error && <small className="ui-error" role="alert">{error}</small>}
    </label>
  )
}

export function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <label className={`ui-field ${className}`}>
      {label && <span className="ui-label">{label}</span>}
      <textarea className={`ui-input ui-textarea ${error ? 'is-invalid' : ''}`} {...props} />
      {hint && !error && <small className="ui-hint">{hint}</small>}
      {error && <small className="ui-error" role="alert">{error}</small>}
    </label>
  )
}

