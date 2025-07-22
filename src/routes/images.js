const express = require('express');
const router = express.Router();

const {
  uploadProductImage,
  deleteProductImage,
  getImageInfo,
  getOptimizedImageUrl
} = require('../controllers/imageController');

// Middleware d'authentification et d'upload
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { uploadSingleProductImage } = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageInfo:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: URL de l'image
 *         public_id:
 *           type: string
 *           description: ID public Cloudinary
 *         format:
 *           type: string
 *           description: Format de l'image
 *         width:
 *           type: integer
 *           description: Largeur en pixels
 *         height:
 *           type: integer
 *           description: Hauteur en pixels
 *         bytes:
 *           type: integer
 *           description: Taille en octets
 */

/**
 * @swagger
 * /api/images/produits/{code}/upload:
 *   post:
 *     summary: Upload une image pour un produit
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code du produit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       200:
 *         description: Image uploadée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     produit:
 *                       $ref: '#/components/schemas/Produit'
 *                     image:
 *                       $ref: '#/components/schemas/ImageInfo'
 *                 message:
 *                   type: string
 *       400:
 *         description: Erreur de validation ou fichier invalide
 *       404:
 *         description: Produit non trouvé
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.post('/produits/:code/upload', 
  authenticateToken, 
  authorizeRole(['GESTIONNAIRE']), 
  uploadSingleProductImage, 
  uploadProductImage
);

/**
 * @swagger
 * /api/images/produits/{code}:
 *   delete:
 *     summary: Supprime l'image d'un produit
 *     tags: [Images]
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
 *         description: Image supprimée avec succès
 *       404:
 *         description: Produit non trouvé ou aucune image
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.delete('/produits/:code', 
  authenticateToken, 
  authorizeRole(['GESTIONNAIRE']), 
  deleteProductImage
);

/**
 * @swagger
 * /api/images/produits/{code}/info:
 *   get:
 *     summary: Récupère les informations de l'image d'un produit
 *     tags: [Images]
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
 *         description: Informations de l'image récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     produit:
 *                       type: object
 *                       properties:
 *                         code:
 *                           type: string
 *                         designation:
 *                           type: string
 *                     image:
 *                       $ref: '#/components/schemas/ImageInfo'
 *       404:
 *         description: Produit ou image non trouvé
 */
router.get('/produits/:code/info', authenticateToken, getImageInfo);

/**
 * @swagger
 * /api/images/produits/{code}/optimized:
 *   get:
 *     summary: Génère une URL optimisée pour l'image d'un produit
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code du produit
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         description: Largeur souhaitée
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *         description: Hauteur souhaitée
 *       - in: query
 *         name: quality
 *         schema:
 *           type: string
 *           default: auto:good
 *         description: Qualité de l'image
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           default: auto
 *         description: Format de sortie
 *     responses:
 *       200:
 *         description: URL optimisée générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     original_url:
 *                       type: string
 *                     optimized_url:
 *                       type: string
 *                     transformations:
 *                       type: object
 *       404:
 *         description: Produit ou image non trouvé
 */
router.get('/produits/:code/optimized', authenticateToken, getOptimizedImageUrl);

module.exports = router;

