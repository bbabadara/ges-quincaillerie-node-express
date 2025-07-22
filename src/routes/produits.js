const express = require('express');
const router = express.Router();

const {
  getProduits,
  getProduitByCode,
  createProduit,
  updateProduit,
  deleteProduit,
  updateStock
} = require('../controllers/produitController');

// Middleware d'authentification
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Produit:
 *       type: object
 *       required:
 *         - code
 *         - designation
 *         - prix_unitaire
 *         - sous_categorie_id
 *       properties:
 *         code:
 *           type: string
 *           description: Code unique du produit
 *         designation:
 *           type: string
 *           description: Désignation du produit
 *         quantite_en_stock:
 *           type: integer
 *           description: Quantité en stock
 *         prix_unitaire:
 *           type: number
 *           format: decimal
 *           description: Prix unitaire du produit
 *         image_url:
 *           type: string
 *           description: URL de l'image du produit
 *         sous_categorie_id:
 *           type: integer
 *           description: ID de la sous-catégorie
 *         actif:
 *           type: boolean
 *           description: Statut actif du produit
 *         date_creation:
 *           type: string
 *           format: date-time
 *         date_modification:
 *           type: string
 *           format: date-time
 *         sous_categorie:
 *           $ref: '#/components/schemas/SousCategorie'
 */

/**
 * @swagger
 * /api/produits:
 *   get:
 *     summary: Récupère tous les produits actifs
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sous_categorie_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID de sous-catégorie
 *       - in: query
 *         name: categorie_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID de catégorie
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par code ou désignation
 *     responses:
 *       200:
 *         description: Liste des produits récupérée avec succès
 */
router.get('/', authenticateToken, getProduits);

/**
 * @swagger
 * /api/produits/{code}:
 *   get:
 *     summary: Récupère un produit par son code
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code du produit
 *     responses:
 *       200:
 *         description: Produit récupéré avec succès
 *       404:
 *         description: Produit non trouvé
 */
router.get('/:code', authenticateToken, getProduitByCode);

/**
 * @swagger
 * /api/produits:
 *   post:
 *     summary: Crée un nouveau produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - designation
 *               - prix_unitaire
 *               - sous_categorie_id
 *             properties:
 *               code:
 *                 type: string
 *               designation:
 *                 type: string
 *               quantite_en_stock:
 *                 type: integer
 *               prix_unitaire:
 *                 type: number
 *               image_url:
 *                 type: string
 *               sous_categorie_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.post('/', authenticateToken, authorizeRole(['GESTIONNAIRE']), createProduit);

/**
 * @swagger
 * /api/produits/{code}:
 *   put:
 *     summary: Met à jour un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - designation
 *               - prix_unitaire
 *             properties:
 *               designation:
 *                 type: string
 *               quantite_en_stock:
 *                 type: integer
 *               prix_unitaire:
 *                 type: number
 *               image_url:
 *                 type: string
 *               sous_categorie_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *       404:
 *         description: Produit non trouvé
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.put('/:code', authenticateToken, authorizeRole(['GESTIONNAIRE']), updateProduit);

/**
 * @swagger
 * /api/produits/{code}/stock:
 *   patch:
 *     summary: Met à jour le stock d'un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantite_en_stock
 *             properties:
 *               quantite_en_stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock mis à jour avec succès
 *       404:
 *         description: Produit non trouvé
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.patch('/:code/stock', authenticateToken, authorizeRole(['GESTIONNAIRE']), updateStock);

/**
 * @swagger
 * /api/produits/{code}:
 *   delete:
 *     summary: Archive un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit archivé avec succès
 *       404:
 *         description: Produit non trouvé
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.delete('/:code', authenticateToken, authorizeRole(['GESTIONNAIRE']), deleteProduit);

module.exports = router;

