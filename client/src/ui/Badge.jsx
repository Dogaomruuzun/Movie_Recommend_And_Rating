import React from 'react'

export default function Badge({ children, color = 'default', className = '' }) {
  const cls = ['ui-badge', `ui-badge--${color}`, className].join(' ')
  return <span className={cls}>{children}</span>
}

