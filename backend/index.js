const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to DB');
  }
});

// ✅ Ping route for testing
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ✅ CLO POST route
app.post('/api/clos', (req, res) => {
  const { description, clo_theme, course_id, created_by } = req.body;

  if (!description || !clo_theme || !course_id || !created_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO clos (description, clo_theme, course_id, created_by, updated_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [description, clo_theme, course_id, created_by], (err, result) => {
    if (err) {
      console.error('Insert CLO error:', err);
      return res.status(500).json({ error: 'Failed to insert CLO' });
    }
    res.json({ success: true, insertedId: result.insertId });
  });
});

app.get('/api/clos', (req, res) => {
  const sql = `
    SELECT clos.*, courses.code AS course_code
    FROM clos
    JOIN courses ON clos.course_id = courses.id
    ORDER BY clos.updated_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch CLOs error:', err);
      return res.status(500).json({ error: 'Failed to fetch CLOs' });
    }
    res.json(results);
  });
});

app.delete('/api/clos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM clos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Delete CLO error:', err);
      return res.status(500).json({ error: 'Failed to delete CLO' });
    }
    res.json({ success: true });
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
