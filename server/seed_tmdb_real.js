require('dotenv').config()
const axios = require('axios')
const pool = require('../db')

const TMDB = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p/w500'

const TARGET = 60

async function tmdbGet(path, params = {}) {
  const url = `${TMDB}${path}`
  const { data } = await axios.get(url, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: 'en-US',
      ...params,
    },
  })
  return data
}

async function insertMovie({ title, overview, year, mainGenre, posterUrl, genres }) {

  const [r] = await pool.execute(
    `INSERT INTO movies (title, description, genre, release_year, poster_url, avg_rating, created_at)
     VALUES (?, ?, ?, ?, ?, 0, NOW())`,
    [
      title,
      overview || 'No description.',
      mainGenre || 'Unknown',
      year || null,
      posterUrl || null,
    ]
  )
  const movieId = r.insertId

  // movie_genres taglerini yaz
  if (Array.isArray(genres) && genres.length) {
    for (const g of genres) {
      const tag = String(g).trim()
      if (!tag) continue
      await pool.execute(
        'INSERT INTO movie_genres (movie_id, tag) VALUES (?, ?)',
        [movieId, tag]
      )
    }
  }

  return movieId
}

async function main() {
  if (!process.env.TMDB_API_KEY) {
    console.error('❌ TMDB_API_KEY missing in server/.env')
    process.exit(1)
  }

  let inserted = 0
  const usedTmdb = new Set()

  const sources = ['/movie/popular', '/movie/top_rated', '/movie/now_playing']

  for (const src of sources) {
    for (let page = 1; page <= 10 && inserted < TARGET; page++) {
      const list = await tmdbGet(src, { page }) //This allows us to fetch data page by page instead of retrieving too many results at once.
      const items = list.results || []

      for (const item of items) {
        if (inserted >= TARGET) break
        if (!item?.id) continue
        if (usedTmdb.has(item.id)) continue
        usedTmdb.add(item.id)

        const d = await tmdbGet(`/movie/${item.id}`)

        const title = d.title || d.original_title || 'Untitled'
        const overview = d.overview || 'No description.'
        const year = d.release_date ? Number(String(d.release_date).slice(0, 4)) : null
        const genreNames = (d.genres || []).map(x => x.name).filter(Boolean)
        const mainGenre = genreNames[0] || 'Unknown'
        const posterUrl = d.poster_path ? `${IMG}${d.poster_path}` : null

        try {
          await insertMovie({
            title,
            overview,
            year,
            mainGenre,
            posterUrl,
            genres: genreNames,
          })
          inserted++
          console.log(`✅ ${inserted}/${TARGET} inserted: ${title}`)
        } catch (e) {
          console.error('❌ insert failed:', title, e.message)
        }
      }
    }
  }

  console.log(`🎬 DONE. Inserted: ${inserted}`)
  await pool.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
