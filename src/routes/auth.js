const express = require('express');
const router = express.Router();

const {
  login,
  getProfile,
  changePassword,
  createUser,
  getUsers,
  deactivateUser,
  reactivateUser
} = require('../controllers/authController');

// Middleware d'authentification
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Utilisateur:
 *       type: object
 *       required:
 *         - nom_utilisateur
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de l'utilisateur
 *         nom_utilisateur:
 *           type: string
 *           description: Nom d'utilisateur unique
 *         role:
 *           type: string
 *           enum: [GESTIONNAIRE, RESPONSABLE_ACHAT, RESPONSABLE_PAIEMENT]
 *           description: Rôle de l'utilisateur
 *         actif:
 *           type: boolean
 *           description: Statut actif de l'utilisateur
 *         date_creation:
 *           type: string
 *           format: date-time
 *         date_modification:
 *           type: string
 *           format: date-time
 *     LoginRequest:
 *       type: object
 *       required:
 *         - nom_utilisateur
 *         - mot_de_passe
 *       properties:
 *         nom_utilisateur:
 *           type: string
 *         mot_de_passe:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             utilisateur:
 *               $ref: '#/components/schemas/Utilisateur'
 *             token:
 *               type: string
 *             expires_in:
 *               type: string
 *         message:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Nom d'utilisateur ou mot de passe incorrect
 *       400:
 *         description: Données manquantes
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Récupère le profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Utilisateur'
 *       401:
 *         description: Non authentifié
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change le mot de passe de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ancien_mot_de_passe
 *               - nouveau_mot_de_passe
 *             properties:
 *               ancien_mot_de_passe:
 *                 type: string
 *               nouveau_mot_de_passe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
 *       400:
 *         description: Données invalides ou ancien mot de passe incorrect
 *       401:
 *         description: Non authentifié
 */
router.put('/change-password', authenticateToken, changePassword);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Liste tous les utilisateurs (Gestionnaire seulement)
 *     tags: [Gestion des utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
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
 *                     $ref: '#/components/schemas/Utilisateur'
 *                 count:
 *                   type: integer
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.get('/users', authenticateToken, authorizeRole(['GESTIONNAIRE']), getUsers);

/**
 * @swagger
 * /api/auth/users:
 *   post:
 *     summary: Crée un nouvel utilisateur (Gestionnaire seulement)
 *     tags: [Gestion des utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_utilisateur
 *               - mot_de_passe
 *               - role
 *             properties:
 *               nom_utilisateur:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [GESTIONNAIRE, RESPONSABLE_ACHAT, RESPONSABLE_PAIEMENT]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.post('/users', authenticateToken, authorizeRole(['GESTIONNAIRE']), createUser);

/**
 * @swagger
 * /api/auth/users/{id}/deactivate:
 *   put:
 *     summary: Désactive un utilisateur (Gestionnaire seulement)
 *     tags: [Gestion des utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur désactivé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.put('/users/:id/deactivate', authenticateToken, authorizeRole(['GESTIONNAIRE']), deactivateUser);

/**
 * @swagger
 * /api/auth/users/{id}/reactivate:
 *   put:
 *     summary: Réactive un utilisateur (Gestionnaire seulement)
 *     tags: [Gestion des utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur réactivé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       403:
 *         description: Accès refusé - Rôle Gestionnaire requis
 */
router.put('/users/:id/reactivate', authenticateToken, authorizeRole(['GESTIONNAIRE']), reactivateUser);

module.exports = router;

