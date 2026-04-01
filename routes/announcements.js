const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route GET /api/announcements/active
// @desc Get the currently active announcement
// @access Public
router.get('/active', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT message, created_at FROM Announcements WHERE is_active = TRUE ORDER BY id DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      return res.json({ message: null });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
