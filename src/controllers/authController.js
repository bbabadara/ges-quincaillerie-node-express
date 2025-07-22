const { prisma } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { hashPassword, verifyPassword, validatePasswordStrength } = require('../utils/password');

// Connexion utilisateur
const login = async (req, res) => {
  try {
    const { nom_utilisateur, mot_de_passe } = req.body;

    // Validation des données
    if (!nom_utilisateur || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        error: 'Nom d\'utilisateur et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        nom_utilisateur: nom_utilisateur.trim(),
        actif: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await verifyPassword(mot_de_passe, utilisateur.mot_de_passe_hache);

    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = generateToken({
      userId: utilisateur.id,
      nom_utilisateur: utilisateur.nom_utilisateur,
      role: utilisateur.role
    });

    // Réponse de succès (sans le mot de passe)
    const { mot_de_passe_hache, ...utilisateurSansMotDePasse } = utilisateur;

    res.status(200).json({
      success: true,
      data: {
        utilisateur: utilisateurSansMotDePasse,
        token,
        expires_in: process.env.JWT_EXPIRES_IN || '24h'
      },
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
};

// Obtenir les informations de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        id: req.user.id,
        actif: true
      },
      select: {
        id: true,
        nom_utilisateur: true,
        role: true,
        actif: true,
        date_creation: true,
        date_modification: true
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    // Validation des données
    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({
        success: false,
        error: 'Ancien et nouveau mot de passe requis'
      });
    }

    // Valider la force du nouveau mot de passe
    const validationResult = validatePasswordStrength(nouveau_mot_de_passe);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe trop faible',
        details: validationResult.errors
      });
    }

    // Récupérer l'utilisateur avec son mot de passe
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        id: req.user.id,
        actif: true
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier l'ancien mot de passe
    const ancienMotDePasseValide = await verifyPassword(ancien_mot_de_passe, utilisateur.mot_de_passe_hache);

    if (!ancienMotDePasseValide) {
      return res.status(400).json({
        success: false,
        error: 'Ancien mot de passe incorrect'
      });
    }

    // Hacher le nouveau mot de passe
    const nouveauMotDePasseHache = await hashPassword(nouveau_mot_de_passe);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id: req.user.id },
      data: { mot_de_passe_hache: nouveauMotDePasseHache }
    });

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de mot de passe'
    });
  }
};

// Créer un nouvel utilisateur (admin seulement)
const createUser = async (req, res) => {
  try {
    const { nom_utilisateur, mot_de_passe, role } = req.body;

    // Validation des données
    if (!nom_utilisateur || !mot_de_passe || !role) {
      return res.status(400).json({
        success: false,
        error: 'Nom d\'utilisateur, mot de passe et rôle requis'
      });
    }

    // Valider le rôle
    const rolesValides = ['GESTIONNAIRE', 'RESPONSABLE_ACHAT', 'RESPONSABLE_PAIEMENT'];
    if (!rolesValides.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rôle invalide',
        details: `Rôles valides: ${rolesValides.join(', ')}`
      });
    }

    // Valider la force du mot de passe
    const validationResult = validatePasswordStrength(mot_de_passe);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe trop faible',
        details: validationResult.errors
      });
    }

    // Hacher le mot de passe
    const motDePasseHache = await hashPassword(mot_de_passe);

    // Créer l'utilisateur
    const nouvelUtilisateur = await prisma.utilisateur.create({
      data: {
        nom_utilisateur: nom_utilisateur.trim(),
        mot_de_passe_hache: motDePasseHache,
        role: role
      },
      select: {
        id: true,
        nom_utilisateur: true,
        role: true,
        actif: true,
        date_creation: true
      }
    });

    res.status(201).json({
      success: true,
      data: nouvelUtilisateur,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec ce nom existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

// Lister tous les utilisateurs (admin seulement)
const getUsers = async (req, res) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom_utilisateur: true,
        role: true,
        actif: true,
        date_creation: true,
        date_modification: true
      },
      orderBy: { nom_utilisateur: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: utilisateurs,
      count: utilisateurs.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Désactiver un utilisateur (admin seulement)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher l'auto-désactivation
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }

    const utilisateur = await prisma.utilisateur.findFirst({
      where: { id: parseInt(id) }
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { actif: false }
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la désactivation de l\'utilisateur'
    });
  }
};

// Réactiver un utilisateur (admin seulement)
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await prisma.utilisateur.findFirst({
      where: { id: parseInt(id) }
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: { actif: true }
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur réactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réactivation de l\'utilisateur'
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  createUser,
  getUsers,
  deactivateUser,
  reactivateUser
};

