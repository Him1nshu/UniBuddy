const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
};

// @route GET /api/admin/stats
// @desc Get system statistics
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [usersResult] = await pool.query('SELECT COUNT(*) as count FROM Users');
    const [itemsResult] = await pool.query('SELECT COUNT(*) as count FROM LostFoundItems');
    const [issuesResult] = await pool.query('SELECT COUNT(*) as count FROM FacilityIssues');

    res.json({
      users: usersResult[0].count,
      lostFoundItems: itemsResult[0].count,
      facilityIssues: issuesResult[0].count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/admin/broadcast
// @desc Send a system-wide notification
router.post('/broadcast', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ msg: 'Message is required' });

    // Insert notification for all students
    await pool.query('INSERT INTO Notifications (user_id, message) SELECT id, ? FROM Users', [message]);
    res.json({ msg: 'Broadcast sent successfully to all users' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/admin/announcements
// @desc Create a new global announcement and optionally set it as active
router.post('/announcements', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { message, is_active } = req.body;
    if (!message) return res.status(400).json({ msg: 'Message is required' });

    // If setting active, deactivate others first
    if (is_active) {
      await pool.query('UPDATE Announcements SET is_active = FALSE');
    }

    await pool.query(
      'INSERT INTO Announcements (message, is_active, created_by) VALUES (?, ?, ?)',
      [message, is_active ? true : false, req.user.id]
    );

    res.json({ msg: 'Announcement created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/admin/announcements
// @desc Get all announcements
router.get('/announcements', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.name as created_by_name FROM Announcements a LEFT JOIN Users u ON a.created_by = u.id ORDER BY a.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
