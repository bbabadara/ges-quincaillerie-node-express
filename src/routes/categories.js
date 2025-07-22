const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie
} = require('../controllers/categorieController');

// Middleware d'authentification (sera implémenté plus tard)
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Categorie:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de la catégorie
 *         nom:
 *           type: string
 *           description: Nom de la catégorie
 *         description:
 *           type: string
 *           description: Description de la catégorie
 *         actif:
 *           type: boolean
 *           description: Statut actif de la catégorie
 *         date_creation:
 *           type: string
 *           format: date-time
 *         date_modification:
 *           type: string
 *           format: date-time
 *         sous_categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SousCategorie'
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Récupère toutes les catégories actives
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Categorie'
 *                 count:
 *                   type: integer
 */
router.get('/', authenticateToken, getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Catégorie récupérée avec succès
 *       404:
 *         description: Catégorie non trouvée
 */
router.get('/:id', authenticateToken, getCategorieById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crée une nouvelle catégorie
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.post('/', authenticateToken, authorizeRole(['GESTIONNAIRE']), createCategorie);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Met à jour une catégorie
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catégorie modifiée avec succès
 *       404:
 *         description: Catégorie non trouvée
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.put('/:id', authenticateToken, authorizeRole(['GESTIONNAIRE']), updateCategorie);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Archive une catégorie
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catégorie archivée avec succès
 *       404:
 *         description: Catégorie non trouvée
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.delete('/:id', authenticateToken, authorizeRole(['GESTIONNAIRE']), deleteCategorie);

module.exports = router;

