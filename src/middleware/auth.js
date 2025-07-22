const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { prisma } = require('../config/database');

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification requis',
        message: 'Veuillez fournir un token d\'authentification valide dans le header Authorization'
      });
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    
    // Vérifier que l'utilisateur existe toujours et est actif
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        id: decoded.userId,
        actif: true
      },
      select: {
        id: true,
        nom_utilisateur: true,
        role: true,
        actif: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé ou inactif',
        message: 'Votre compte n\'existe plus ou a été désactivé'
      });
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: utilisateur.id,
      nom_utilisateur: utilisateur.nom_utilisateur,
      role: utilisateur.role
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    if (error.message === 'Token expiré') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré',
        message: 'Votre session a expiré, veuillez vous reconnecter'
      });
    }
    
    if (error.message === 'Token invalide') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide',
        message: 'Le token d\'authentification fourni est invalide'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Erreur d\'authentification',
      message: 'Impossible de vérifier votre authentification'
    });
  }
};

// Middleware d'autorisation par rôle
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non authentifié',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé',
          message: `Votre rôle (${req.user.role}) ne vous permet pas d'accéder à cette ressource. Rôles autorisés: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Erreur d\'autorisation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur d\'autorisation',
        message: 'Impossible de vérifier vos permissions'
      });
    }
  };
};

// Middleware optionnel d'authentification (n'échoue pas si pas de token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      
      const utilisateur = await prisma.utilisateur.findFirst({
        where: {
          id: decoded.userId,
          actif: true
        },
        select: {
          id: true,
          nom_utilisateur: true,
          role: true,
          actif: true
        }
      });

      if (utilisateur) {
        req.user = {
          id: utilisateur.id,
          nom_utilisateur: utilisateur.nom_utilisateur,
          role: utilisateur.role
        };
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

// Middleware pour vérifier si l'utilisateur peut modifier ses propres données
const authorizeOwnerOrRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non authentifié'
        });
      }

      const targetUserId = parseInt(req.params.userId || req.params.id);
      
      // L'utilisateur peut modifier ses propres données ou avoir un rôle autorisé
      if (req.user.id === targetUserId || allowedRoles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: 'Vous ne pouvez modifier que vos propres données ou vous n\'avez pas les permissions nécessaires'
      });
    } catch (error) {
      console.error('Erreur d\'autorisation propriétaire:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur d\'autorisation'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuth,
  authorizeOwnerOrRole
};

