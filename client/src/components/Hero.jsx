import React from 'react'
import Icon from '../ui/Icon'
import Button from '../ui/Button'
//This component renders a search section with a title, description, and search form.
export default function Hero({ query, onQueryChange, onSearch }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">Find Your Next Favorite Movie</h1>
        <p className="hero-sub">Personalized recommendations, rich catalog, and community reviews.</p>
        <form className="hero-search" onSubmit={e => { e.preventDefault(); onSearch?.() }} role="search" aria-label="Search movies">
          <Icon name="search" className="hero-search-icon" />
          <input
            className="hero-input"
            placeholder="Search by title or description"
            value={query}
            onChange={e => onQueryChange?.(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
    </section>
  )
}

