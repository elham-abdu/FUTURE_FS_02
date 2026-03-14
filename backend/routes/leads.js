const express = require('express');
const db = require('../config/database');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply protection to all routes except public form submission
// Public route for form submission is at the top

// @route   POST /api/leads
// @desc    Create new lead (public form)
// @access  Public
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('source').isIn(['Website', 'LinkedIn', 'Referral', 'Social Media', 'Other']).withMessage('Invalid source')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { name, email, phone, source } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO leads (name, email, phone, source) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, source]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// All routes below require authentication
router.use(protect);

// @route   GET /api/leads
// @desc    Get all leads with filters
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, search, sortBy, startDate, endDate } = req.query;
    let query = 'SELECT * FROM leads WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Filter by status
    if (status && status !== 'all') {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    // Search by name or email
    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Filter by date range
    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }
    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    // Sorting
    if (sortBy === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sortBy === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else if (sortBy === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY created_at DESC'; // default newest first
    }

    const result = await db.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead with notes
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    // Get lead
    const leadResult = await db.query(
      'SELECT * FROM leads WHERE id = $1',
      [req.params.id]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    // Get notes for this lead
    const notesResult = await db.query(
      'SELECT * FROM notes WHERE lead_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    const lead = leadResult.rows[0];
    lead.notes = notesResult.rows;

    res.json({
      success: true,
      data: lead
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/leads/:id/status
// @desc    Update lead status
// @access  Private
router.put('/:id/status', [
  body('status').isIn(['new', 'contacted', 'converted']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { status, conversionValue } = req.body;
    
    let query = 'UPDATE leads SET status = $1';
    const values = [status];
    let paramCount = 2;

    // If converting, add conversion date and value
    if (status === 'converted') {
      query += `, converted_at = $${paramCount}`;
      values.push(new Date());
      paramCount++;
      
      if (conversionValue) {
        query += `, conversion_value = $${paramCount}`;
        values.push(conversionValue);
        paramCount++;
      }
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(req.params.id);

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/leads/:id/notes
// @desc    Add note to lead
// @access  Private
router.post('/:id/notes', [
  body('content').notEmpty().withMessage('Note content is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // Check if lead exists
    const leadCheck = await db.query(
      'SELECT * FROM leads WHERE id = $1',
      [req.params.id]
    );

    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    // Add note
    const noteResult = await db.query(
      'INSERT INTO notes (lead_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.body.content, req.user ? req.user.username : 'Admin']
    );

    // Get updated lead with notes
    const leadResult = await db.query(
      'SELECT * FROM leads WHERE id = $1',
      [req.params.id]
    );
    
    const notesResult = await db.query(
      'SELECT * FROM notes WHERE lead_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    const lead = leadResult.rows[0];
    lead.notes = notesResult.rows;

    res.json({
      success: true,
      data: lead
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Notes will be automatically deleted due to CASCADE
    const result = await db.query(
      'DELETE FROM leads WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;