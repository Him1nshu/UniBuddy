const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

// Note: Create Notifications table dynamically if missing
pool.query(`
  CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  )
`).catch(console.error);

// @route GET /api/notifications
// @desc Get user notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const [notifs] = await pool.query('SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(notifs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/notifications/:id/read
// @desc Mark notification as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE Notifications SET is_read = true WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ msg: 'Marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
