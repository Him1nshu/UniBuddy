const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// @route POST /api/auth/google
// @desc Login/Register with Google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ msg: 'No token provided' });

    // Decode without verifying signature for easiest mock implementation
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    const { email, name } = decoded;
    // Hardcode super admin profile check
    const isAdmin = email === 'admin@unibuddy.com';
    const role = isAdmin ? 'admin' : 'student';

    // Check if user exists
    let [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    let user = users[0];

    if (!user) {
      // Create user if they don't exist
      const pass = 'google-auth'; 
      const [result] = await pool.query(
        'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name || email.split('@')[0], email, pass, role]
      );
      user = { id: result.insertId, name: name || email.split('@')[0], email, role };
    } else {
      // If user exists, optionally update role if it should be admin
      if (isAdmin && user.role !== 'admin') {
         await pool.query('UPDATE Users SET role = ? WHERE id = ?', ['admin', user.id]);
         user.role = 'admin';
      }
    }

    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' }, (err, sessionToken) => {
      if (err) throw err;
      res.json({ token: sessionToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/register
// @desc Register a new user
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
    const [result] = await pool.query(
      'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, userRole]
    );

    const payload = { id: result.insertId, role: userRole };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: result.insertId, name, email, role: userRole } });
    });
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
