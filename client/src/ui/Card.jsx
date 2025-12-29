import React from 'react'

export default function Card({ className = '', children, interactive = false, ...props }) {
  const cls = ['ui-card', interactive ? 'ui-card--interactive' : '', className].filter(Boolean).join(' ')
  return (
    <div className={cls} {...props}>{children}</div>
  )
}

