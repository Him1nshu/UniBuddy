const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// @route POST /api/auth/register
// @desc Create a new user account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const [users] = await pool.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'student';

    await pool.query(
        'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, userRole]
    );

    // Registration successful, standard logic dictates we inform the client to login.
    res.json({ msg: 'Registration complete. Please log in.' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/login
// @desc Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Hardcoded credentials
    if (email === 'admin@unibuddy.com' && password === 'admin123') {
      const payload = { id: 999, role: 'admin' };
      return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: 999, name: 'Admin User', email, role: 'admin' } });
      });
    }

    if (email === 'student@unibuddy.com' && password === 'student123') {
      const payload = { id: 888, role: 'student' };
      return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: 888, name: 'Student User', email, role: 'student' } });
      });
    }

      const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
      const user = users[0];
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
