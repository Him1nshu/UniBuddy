const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @route GET /api/items
// @desc Get all lost and found items
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT LostFoundItems.*, Users.name as reported_by_name 
      FROM LostFoundItems 
      JOIN Users ON LostFoundItems.reported_by = Users.id 
      ORDER BY created_at DESC
    `);
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/items
// @desc Report a new item
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, type } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!title || !description || !category || !type) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO LostFoundItems (title, description, category, type, image_url, reported_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, category, type, imageUrl, req.user.id]
    );
    
    // Auto-matching logic
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const [potentialMatches] = await pool.query(
      'SELECT * FROM LostFoundItems WHERE type = ? AND category = ? AND status = "open" AND reported_by != ?',
      [oppositeType, category, req.user.id]
    );
    
    const words = `${title} ${description}`.toLowerCase().split(/[\s,.'"?]+/).filter(w => w.length > 3);
    
    for (let match of potentialMatches) {
        const matchText = `${match.title} ${match.description}`.toLowerCase();
        let matchScore = 0;
        for (let w of words) {
            if (matchText.includes(w)) matchScore++;
        }
        
        // If there's a strong match (at least 1 significant word overlap within the same category)
        if (matchScore >= 1) {
            if (type === 'found') {
                // Someone reported a found item. Notify the person who lost a matching item.
                const msg = `Good news! A found item "${title}" was just reported that might match your lost item "${match.title}".`;
                await pool.query('INSERT INTO Notifications (user_id, message) VALUES (?, ?)', [match.reported_by, msg]);
            } else if (type === 'lost') {
                // Someone reported a lost item. Notify them that a matching item has already been found.
                const msg = `Good news! We already have a found item "${match.title}" in the system that might match the item you just reported as lost.`;
                await pool.query('INSERT INTO Notifications (user_id, message) VALUES (?, ?)', [req.user.id, msg]);
            }
        }
    }

    res.json({ id: result.insertId, msg: 'Item reported successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/items/:id/status
// @desc Update item status
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    // Check if user is owner or admin
    const [items] = await pool.query('SELECT * FROM LostFoundItems WHERE id = ?', [req.params.id]);
    if (items.length === 0) return res.status(404).json({ msg: 'Item not found' });
    
    const item = items[0];
    if (item.reported_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await pool.query('UPDATE LostFoundItems SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ msg: 'Status updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route DELETE /api/items/:id
// @desc Delete an item (Admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized as admin' });
    }
    
    await pool.query('DELETE FROM LostFoundItems WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
