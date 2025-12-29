import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Icon from '../ui/Icon'

export default function HistoryCard({ movie }) {
  const tags = Array.isArray(movie.genres)
    ? movie.genres
    : (typeof movie.genres === 'string' && movie.genres ? movie.genres.split(',') : (movie.genre ? [movie.genre] : []));
  const avg = Number(movie.avg_rating || 0).toFixed(1) //Get the average rating and format it to one decimal place
  const mine = Number.isFinite(Number(movie.my_rating)) ? Number(movie.my_rating) : null
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card" aria-label={`Open details for ${movie.title}`}>
      <div className="movie-card__bg" style={{ backgroundImage: `url(${movie.poster_url || ''})` }} />
      <div className="movie-card__overlay" />
      <div className="movie-card__content">
        <div className="movie-card__top">
          <div className="movie-card__tags">
            {tags.slice(0, 3).map((t, i) => (
              <Badge key={i}>{t}</Badge>
            ))}
          </div>
          <span className="movie-card__year">{movie.release_year}</span>
        </div>
        <h3 className="movie-card__title">{movie.title}</h3>
        <div className="movie-card__meta">
          {mine !== null ? (
            <>
              You: <Icon name="star" size={14} /> {mine} • <Icon name="star" size={14} /> {avg}
            </>
          ) : (
            <>
              <Icon name="star" size={14} /> {avg}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
