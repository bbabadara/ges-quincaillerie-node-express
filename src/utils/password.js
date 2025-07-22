const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// Hacher un mot de passe
const hashPassword = async (password) => {
  try {
    if (!password || password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return hashedPassword;
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe:', error);
    throw new Error('Erreur lors du hachage du mot de passe');
  }
};

// Vérifier un mot de passe
const verifyPassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return false;
  }
};

// Valider la force d'un mot de passe
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Le mot de passe est requis');
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (password.length > 128) {
    errors.push('Le mot de passe ne peut pas dépasser 128 caractères');
  }

  // Vérifier qu'il contient au moins une lettre
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre');
  }

  // Vérifier qu'il contient au moins un chiffre
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Générer un mot de passe temporaire
const generateTemporaryPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateTemporaryPassword
};

