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
app.post('/api/course-outcomes', (req, res) => {
  const { courseCode, cloNumber, description } = req.body;

  if (!courseCode || !cloNumber || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const sql = `
    INSERT INTO course_outcomes (course_code, clo_number, description)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [courseCode, cloNumber, description], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }
    res.json({ success: true, insertedId: result.insertId });
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
