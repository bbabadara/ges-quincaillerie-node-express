const express = require('express');
const router = express.Router();

const {
  getSousCategories,
  getSousCategorieById,
  createSousCategorie,
  updateSousCategorie,
  deleteSousCategorie
} = require('../controllers/sousCategorieController');

// Middleware d'authentification (sera implémenté plus tard)
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     SousCategorie:
 *       type: object
 *       required:
 *         - nom
 *         - categorie_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de la sous-catégorie
 *         nom:
 *           type: string
 *           description: Nom de la sous-catégorie
 *         description:
 *           type: string
 *           description: Description de la sous-catégorie
 *         categorie_id:
 *           type: integer
 *           description: ID de la catégorie parente
 *         actif:
 *           type: boolean
 *           description: Statut actif de la sous-catégorie
 *         date_creation:
 *           type: string
 *           format: date-time
 *         date_modification:
 *           type: string
 *           format: date-time
 *         categorie:
 *           $ref: '#/components/schemas/Categorie'
 *         produits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Produit'
 */

/**
 * @swagger
 * /api/sous-categories:
 *   get:
 *     summary: Récupère toutes les sous-catégories actives
 *     tags: [Sous-catégories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categorie_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID de catégorie
 *     responses:
 *       200:
 *         description: Liste des sous-catégories récupérée avec succès
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
 *                     $ref: '#/components/schemas/SousCategorie'
 *                 count:
 *                   type: integer
 */
router.get('/', authenticateToken, getSousCategories);

/**
 * @swagger
 * /api/sous-categories/{id}:
 *   get:
 *     summary: Récupère une sous-catégorie par son ID
 *     tags: [Sous-catégories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sous-catégorie
 *     responses:
 *       200:
 *         description: Sous-catégorie récupérée avec succès
 *       404:
 *         description: Sous-catégorie non trouvée
 */
router.get('/:id', authenticateToken, getSousCategorieById);

/**
 * @swagger
 * /api/sous-categories:
 *   post:
 *     summary: Crée une nouvelle sous-catégorie
 *     tags: [Sous-catégories]
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
 *               - categorie_id
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               categorie_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sous-catégorie créée avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.post('/', authenticateToken, authorizeRole(['GESTIONNAIRE']), createSousCategorie);

/**
 * @swagger
 * /api/sous-categories/{id}:
 *   put:
 *     summary: Met à jour une sous-catégorie
 *     tags: [Sous-catégories]
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
 *               categorie_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sous-catégorie modifiée avec succès
 *       404:
 *         description: Sous-catégorie non trouvée
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.put('/:id', authenticateToken, authorizeRole(['GESTIONNAIRE']), updateSousCategorie);

/**
 * @swagger
 * /api/sous-categories/{id}:
 *   delete:
 *     summary: Archive une sous-catégorie
 *     tags: [Sous-catégories]
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
 *         description: Sous-catégorie archivée avec succès
 *       404:
 *         description: Sous-catégorie non trouvée
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.delete('/:id', authenticateToken, authorizeRole(['GESTIONNAIRE']), deleteSousCategorie);

module.exports = router;

