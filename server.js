const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres.adxqtfqlbrgbrskpwbyc:Vimalboss@45@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

// Ensure users table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  } else {
    console.log('✅ Users table is ready.');
  }
});

// Register route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, password]
    );
    res.status(201).json({ message: 'User registered!', user: result.rows[0] });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed (email may be taken).' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Login successful ✅', user: result.rows[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials ❌' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
