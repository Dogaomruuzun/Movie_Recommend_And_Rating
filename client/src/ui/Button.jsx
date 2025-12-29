import React from 'react'

const base = 'ui-btn'
const variants = {
  primary: 'ui-btn--primary',
  secondary: 'ui-btn--secondary',
  outline: 'ui-btn--outline',
  ghost: 'ui-btn--ghost',
}
const sizes = {
  sm: 'ui-btn--sm',
  md: 'ui-btn--md',
  lg: 'ui-btn--lg',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const cls = [base, variants[variant] || variants.primary, sizes[size] || sizes.md, className].filter(Boolean).join(' ')
  return (
    <button className={cls} {...props}>{children}</button>
  )
}

