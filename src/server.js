require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { hashPassword } = require('./utils/password');

const { connectDatabase } = require('./config/database');
const { verifyCloudinaryConfig } = require('./config/cloudinary');
const { setupSwagger } = require('./config/swagger');

// Import des routes
const authRoutes = require('./routes/auth');
const categorieRoutes = require('./routes/categories');
const sousCategorieRoutes = require('./routes/sousCategories');
const produitRoutes = require('./routes/produits');
const fournisseurRoutes = require('./routes/fournisseurs');
const commandeRoutes = require('./routes/commandes');
const paiementRoutes = require('./routes/paiements');
const statsRoutes = require('./routes/stats');
const imageRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;



// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});

// Middlewares de sécurité
app.use(helmet());
app.use(limiter);

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API Quincaillerie Barro et frère - Serveur en fonctionnement',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/sous-categories', sousCategorieRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/images', imageRoutes);

// Configuration de la documentation Swagger
setupSwagger(app);

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas sur ce serveur.`
  });
});

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  // Erreur de validation Prisma
  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Violation de contrainte unique',
      message: 'Cette valeur existe déjà dans la base de données.'
    });
  }
  
  // Erreur de relation Prisma
  if (error.code === 'P2003') {
    return res.status(400).json({
      error: 'Violation de contrainte de clé étrangère',
      message: 'Référence invalide vers un enregistrement inexistant.'
    });
  }
  
  // Erreur de validation JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'JSON invalide',
      message: 'Le format des données envoyées est incorrect.'
    });
  }
  
  // Erreur générique
  res.status(error.status || 500).json({
    error: error.message || 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.stack : 'Une erreur inattendue s\'est produite.'
  });
});

// Démarrage du serveur
async function startServer() {
  try {
     const password = 'admin123';
    const hashed = await hashPassword(password);
    console.log('Mot de passe hashé :', hashed);
    // Connexion à la base de données
    await connectDatabase();
    
    // Vérification de la configuration Cloudinary
    verifyCloudinaryConfig();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check disponible sur http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Démarrage de l'application
startServer();

module.exports = app;

