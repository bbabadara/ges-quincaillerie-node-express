const express = require('express');
const router = express.Router();

// Routes temporaires - seront implémentées dans cette phase
router.get('/current-orders', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/today-deliveries', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/total-debt', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/today-payments', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

module.exports = router;

