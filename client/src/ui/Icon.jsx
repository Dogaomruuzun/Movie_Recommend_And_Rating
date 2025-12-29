import React from 'react'

const paths = {
  star: 'M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193z',
  search: 'M11 19a8 8 0 1 1 5.293-14.293A8 8 0 0 1 11 19zm6.707 1.293-3.387-3.387',
  user: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 2.5-9 5v1h18v-1c0-2.5-4-5-9-5z',
  logout: 'M16 17l5-5-5-5M21 12H9M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  admin: 'M4 22h16V2H4zm4-4h8v2H8zM8 6h8v10H8z',
  history: 'M12 8v5l4 2M12 22A10 10 0 1 1 22 12 10 10 0 0 1 12 22z',
}

export default function Icon({ name, size = 18, stroke = 2, className = '' }) {
  const p = paths[name]
  if (!p) return null
  const isStroke = ['search','logout','chevronLeft','chevronRight','history'].includes(name)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`ui-icon ${className}`}
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? 'currentColor' : 'none'}
      strokeWidth={isStroke ? stroke : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={p} />
    </svg>
  )
}

