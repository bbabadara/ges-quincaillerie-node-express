const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Générer un token JWT
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'quincaillerie-barro-api',
      audience: 'quincaillerie-barro-client'
    });
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    throw new Error('Erreur lors de la génération du token');
  }
};

// Vérifier un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'quincaillerie-barro-api',
      audience: 'quincaillerie-barro-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    } else {
      throw new Error('Erreur lors de la vérification du token');
    }
  }
};

// Décoder un token sans vérification (pour debug)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};

// Extraire le token du header Authorization
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader
};

