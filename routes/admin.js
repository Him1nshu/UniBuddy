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

module.exports = router;
