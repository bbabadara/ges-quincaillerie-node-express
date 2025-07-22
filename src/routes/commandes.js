const express = require('express');
const router = express.Router();

// Routes temporaires - seront implémentées dans cette phase
router.get('/', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/filter', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.put('/:id/cancel', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

module.exports = router;

