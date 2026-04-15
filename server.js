const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create the app and database
const app = express();
const dataDir = process.env.RENDER ? '/tmp' : __dirname;
const dbPath = path.join(dataDir, 'bookmarks.db');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;
try {
  db = new Database(dbPath);
} catch (error) {
  console.error('Failed to open SQLite database:', error);
  process.exit(1);
}

// Middleware - tells Express to understand JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create the bookmarks table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    tag TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API ROUTES

// Get all bookmarks
app.get('/api/bookmarks', (req, res) => {
  const bookmarks = db.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC').all();
  res.json(bookmarks);
});

// Add a new bookmark
app.post('/api/bookmarks', (req, res) => {
  const { title, url, tag } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }
  const result = db.prepare('INSERT INTO bookmarks (title, url, tag) VALUES (?, ?, ?)').run(title, url, tag || 'general');
  res.json({ id: result.lastInsertRowid, title, url, tag: tag || 'general' });
});

// Delete a bookmark
app.delete('/api/bookmarks/:id', (req, res) => {
  db.prepare('DELETE FROM bookmarks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using SQLite database at ${dbPath}`);
});