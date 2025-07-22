const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/paiements:
 *   post:
 *     summary: Enregistre un paiement
 *     tags: [Paiements]
 *     responses:
 *       501:
 *         description: Route non encore implémentée
 */

/**
 * @swagger
 * /api/paiements/commande/{id}/historique:
 *   get:
 *     summary: Récupère l'historique des paiements d'une commande
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la commande
 *     responses:
 *       501:
 *         description: Route non encore implémentée
 */

/**
 * @swagger
 * /api/paiements/commande/{id}/montant-restant:
 *   get:
 *     summary: Récupère le montant restant à payer pour une commande
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la commande
 *     responses:
 *       501:
 *         description: Route non encore implémentée
 */

/**
 * @swagger
 * /api/paiements/fournisseur/{id}/dette:
 *   get:
 *     summary: Récupère la dette d'un fournisseur
 *     tags: [Paiements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du fournisseur
 *     responses:
 *       501:
 *         description: Route non encore implémentée
 */

// ...existing code...
router.post('/', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/commande/:id/historique', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/commande/:id/montant-restant', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

router.get('/fournisseur/:id/dette', (req, res) => {
  res.status(501).json({ success: false, error: 'Route non encore implémentée' });
});

module.exports = router;