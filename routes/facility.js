const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

// @route GET /api/facility
// @desc Get all facility issues
router.get('/', requireAuth, async (req, res) => {
  try {
    const [issues] = await pool.query(`
      SELECT 
        FacilityIssues.*, 
        Users.name as reported_by_name,
        COUNT(FacilityUpvotes.id) as upvotes,
        MAX(CASE WHEN FacilityUpvotes.user_id = ? THEN 1 ELSE 0 END) as has_upvoted
      FROM FacilityIssues 
      JOIN Users ON FacilityIssues.reported_by = Users.id 
      LEFT JOIN FacilityUpvotes ON FacilityIssues.id = FacilityUpvotes.issue_id
      GROUP BY FacilityIssues.id
      ORDER BY FacilityIssues.created_at DESC
    `, [req.user.id]);
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/facility
// @desc Report a new facility issue
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, room, description } = req.body;
    if (!title || !room || !description) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO FacilityIssues (title, room, description, reported_by) VALUES (?, ?, ?, ?)',
      [title, room, description, req.user.id]
    );
    
    res.json({ id: result.insertId, msg: 'Issue reported successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/facility/:id/status
// @desc Update facility issue status (Admin only)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized as admin' });
    }
    const { status } = req.body;
    await pool.query('UPDATE FacilityIssues SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ msg: 'Issue status updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route DELETE /api/facility/:id
// @desc Delete a facility issue (Admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized as admin' });
    }
    
    await pool.query('DELETE FROM FacilityIssues WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Facility issue deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST /api/facility/:id/upvote
// @desc Toggle upvote for a facility issue
router.post('/:id/upvote', requireAuth, async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    // Check if issue exists
    const [issueRows] = await pool.query('SELECT id FROM FacilityIssues WHERE id = ?', [issueId]);
    if (issueRows.length === 0) {
        return res.status(404).json({ msg: 'Issue not found' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM FacilityUpvotes WHERE issue_id = ? AND user_id = ?',
      [issueId, userId]
    );

    if (existing.length > 0) {
      // Already upvoted, so toggle off
      await pool.query('DELETE FROM FacilityUpvotes WHERE id = ?', [existing[0].id]);
      res.json({ msg: 'Upvote removed' });
    } else {
      // Add upvote
      await pool.query('INSERT INTO FacilityUpvotes (issue_id, user_id) VALUES (?, ?)', [issueId, userId]);
      res.json({ msg: 'Upvote added' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
