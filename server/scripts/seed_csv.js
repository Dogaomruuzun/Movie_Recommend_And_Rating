require('dotenv').config()
const fs = require('fs')
const path = require('path')
const pool = require('../db')


function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',')

    const result = []
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line) continue


        const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))

        const obj = {}
        headers.forEach((h, index) => {
            obj[h.trim()] = row[index]
        })
        result.push(obj)
    }
    return result
}

async function seed() {
    try {
        const csvPath = path.join(__dirname, '../data/movies.csv')
        const csvContent = fs.readFileSync(csvPath, 'utf8')
        const movies = parseCSV(csvContent)

        console.log(`Found ${movies.length} movies in CSV.`)

        const conn = await pool.getConnection()
        await conn.beginTransaction()

        try {


            for (const m of movies) {
                // Validation
                if (!m.title) continue

                // Insert or Update movie
                const [res] = await conn.execute(
                    `INSERT INTO movies (title, description, genre, release_year, poster_url, avg_rating, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
             description=VALUES(description), 
             genre=VALUES(genre), 
             release_year=VALUES(release_year), 
             poster_url=VALUES(poster_url),
             avg_rating=VALUES(avg_rating)`,
                    [m.title, m.description, m.genre, m.release_year, m.poster_url, m.avg_rating || 0]
                )


                let movieId = res.insertId
                if (movieId === 0) {
                    const [[existing]] = await conn.execute('SELECT id FROM movies WHERE title = ?', [m.title])
                    movieId = existing.id
                }

  
                await conn.execute('DELETE FROM movie_genres WHERE movie_id = ?', [movieId])
                await conn.execute('INSERT INTO movie_genres (movie_id, tag) VALUES (?, ?)', [movieId, m.genre])

            }

            await conn.commit()
            console.log('Seeding completed successfully.')
        } catch (err) {
            await conn.rollback()
            throw err
        } finally {
            conn.release()
        }

    } catch (e) {
        console.error('Seed error:', e)
    } finally {
        process.exit()
    }
}

seed()
