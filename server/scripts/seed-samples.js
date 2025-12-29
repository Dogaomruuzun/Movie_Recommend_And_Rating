const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');
const db = new Database(DB_PATH);

const samples = [
  {
    title: 'The Matrix',
    description: 'A hacker discovers the reality is a simulation and joins a rebellion.',
    genre: 'Sci-Fi',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    release_year: 1999,
    poster_url: 'https://m.media-amazon.com/images/I/51vpnbwFHrL._AC_.jpg'
  },
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten a newly formed symbiotic relationship between the wealthy and the destitute.',
    genre: 'Thriller',
    genres: ['Thriller', 'Drama'],
    release_year: 2019,
    poster_url: 'https://m.media-amazon.com/images/I/71tG0NQyIvL._AC_SL1024_.jpg'
  },
  {
    title: 'Spirited Away',
    description: 'During her family’s move to the suburbs, a 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
    genre: 'Animation',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    release_year: 2001,
    poster_url: 'https://m.media-amazon.com/images/I/81s+4A+4jhL._AC_SL1500_.jpg'
  },
  {
    title: 'Whiplash',
    description: 'A promising young drummer enrolls at a cut-throat music conservatory where an abusive instructor pushes him to the brink.',
    genre: 'Drama',
    genres: ['Drama', 'Music'],
    release_year: 2014,
    poster_url: 'https://m.media-amazon.com/images/I/71yqjUeE0eL._AC_SL1344_.jpg'
  },
  {
    title: 'Mad Max: Fury Road',
    description: 'In a post-apocalyptic wasteland, Max helps a rebellious woman and a group of female prisoners.',
    genre: 'Action',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    release_year: 2015,
    poster_url: 'https://m.media-amazon.com/images/I/81YvQ7x9vML._AC_SL1500_.jpg'
  },
  {
    title: 'The Grand Budapest Hotel',
    description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years.',
    genre: 'Comedy',
    genres: ['Comedy', 'Drama'],
    release_year: 2014,
    poster_url: 'https://m.media-amazon.com/images/I/81eS8n2xb1L._AC_SL1500_.jpg'
  },
  {
    title: 'Her',
    description: 'A lonely writer develops an unlikely relationship with an operating system.',
    genre: 'Romance',
    genres: ['Romance', 'Drama', 'Sci-Fi'],
    release_year: 2013,
    poster_url: 'https://m.media-amazon.com/images/I/71G-3c7gEQL._AC_SL1111_.jpg'
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
    genre: 'Drama',
    genres: ['Drama', 'Crime'],
    release_year: 1994,
    poster_url: 'https://m.media-amazon.com/images/I/51NiGlapXlL._AC_.jpg'
  },
  {
    title: 'Coco',
    description: 'Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather.',
    genre: 'Animation',
    genres: ['Animation', 'Family', 'Adventure'],
    release_year: 2017,
    poster_url: 'https://m.media-amazon.com/images/I/81i2rWmJYOL._AC_SL1333_.jpg'
  },
  {
    title: 'Dune',
    description: 'A noble family becomes embroiled in a war for control over the galaxy’s most valuable asset.',
    genre: 'Sci-Fi',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    release_year: 2021,
    poster_url: 'https://m.media-amazon.com/images/I/71sfk7KqY-L._AC_SL1333_.jpg'
  }
];

const insertMovie = db.prepare('INSERT INTO movies (title, description, genre, release_year, poster_url) VALUES (?,?,?,?,?)');
const insTag = db.prepare('INSERT OR IGNORE INTO movie_genres (movie_id, tag) VALUES (?, ?)');
const selectByTitle = db.prepare('SELECT id FROM movies WHERE title = ?');

let inserted = 0; let tagged = 0;
db.transaction(() => {
  for (const s of samples) {
    const existing = selectByTitle.get(s.title);
    if (existing && existing.id) {
      const baseTags = new Set([s.genre, ...(s.genres || [])]);
      for (const t of baseTags) { insTag.run(existing.id, t); tagged++; }
      continue;
    }
    const info = insertMovie.run(s.title, s.description, s.genre, s.release_year, s.poster_url);
    inserted++;
    const movieId = info.lastInsertRowid;
    const baseTags = new Set([s.genre, ...(s.genres || [])]);
    for (const t of baseTags) { insTag.run(movieId, t); tagged++; }
  }
})();

console.log(JSON.stringify({ ok: true, inserted, tagged }));
