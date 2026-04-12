const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'notice_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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

// @route GET /api/admin/rooms
// @desc Get all room info/helplines
router.get('/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM RoomInfo ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/admin/rooms
// @desc Add room/helpline info
router.post('/rooms', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type, keyword, details } = req.body;
    if (!type || !keyword || !details) return res.status(400).json({ msg: 'Please provide type, keyword, and details' });
    
    await pool.query('INSERT INTO RoomInfo (type, keyword, details) VALUES (?, ?, ?)', [type, keyword, details]);
    res.json({ msg: 'Room/Helpline info added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route DELETE /api/admin/rooms/:id
// @desc Delete room info
router.delete('/rooms/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM RoomInfo WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/admin/upload-notice
// @desc Upload a PDF notice to the knowledge base
router.post('/upload-notice', requireAuth, requireAdmin, upload.single('noticePdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const content = data.text.trim();
    
    if (!content) {
      return res.status(400).json({ msg: 'Could not extract text from PDF.' });
    }

    await pool.query('INSERT INTO KnowledgeBase (filename, content) VALUES (?, ?)', [req.file.originalname, content]);
    
    res.json({ msg: 'PDF text parsed and added to Knowledge Base correctly.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
