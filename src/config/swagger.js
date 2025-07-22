const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration de base Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Quincaillerie Barro et frère',
      version: '1.0.0',
      description: `
        API REST pour la gestion des commandes et livraisons de la quincaillerie Barro et frère.
        
        ## Fonctionnalités principales
        
        ### Gestion des produits
        - Catégories et sous-catégories
        - Produits avec images (Cloudinary)
        - Gestion des stocks
        
        ### Gestion des commandes
        - Commandes fournisseurs
        - Suivi des livraisons
        - Gestion des paiements par versements
        
        ### Authentification et autorisation
        - Connexion par JWT
        - Rôles: Gestionnaire, Responsable Achat, Responsable Paiement
        
        ### Statistiques
        - Commandes en cours
        - Commandes à livrer
        - Dette totale
        - Versements du jour
        
        ## Authentification
        
        La plupart des endpoints nécessitent une authentification via token JWT.
        
        1. Connectez-vous via \`POST /api/auth/login\`
        2. Utilisez le token retourné dans le header \`Authorization: Bearer <token>\`
        
        ## Rôles et permissions
        
        - **Gestionnaire**: Accès complet (CRUD sur toutes les entités)
        - **Responsable Achat**: Gestion des commandes fournisseurs
        - **Responsable Paiement**: Gestion des paiements et statistiques
      `,
      contact: {
        name: 'Support API',
        email: 'support@quincaillerie-barro.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.quincaillerie-barro.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /api/auth/login'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token d\'authentification manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Token d\'authentification requis'
                  },
                  message: {
                    type: 'string',
                    example: 'Veuillez fournir un token d\'authentification valide'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès refusé - Permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Accès refusé'
                  },
                  message: {
                    type: 'string',
                    example: 'Votre rôle ne vous permet pas d\'accéder à cette ressource'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Données invalides'
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['Le nom est requis', 'Le prix doit être supérieur à 0']
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Ressource non trouvée'
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'string',
                    example: 'Erreur interne du serveur'
                  },
                  message: {
                    type: 'string',
                    example: 'Une erreur inattendue s\'est produite'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentification',
        description: 'Gestion de l\'authentification et des utilisateurs'
      },
      {
        name: 'Gestion des utilisateurs',
        description: 'Administration des comptes utilisateurs'
      },
      {
        name: 'Catégories',
        description: 'Gestion des catégories de produits'
      },
      {
        name: 'Sous-catégories',
        description: 'Gestion des sous-catégories de produits'
      },
      {
        name: 'Produits',
        description: 'Gestion des produits et stocks'
      },
      {
        name: 'Fournisseurs',
        description: 'Gestion des fournisseurs'
      },
      {
        name: 'Commandes',
        description: 'Gestion des commandes fournisseurs'
      },
      {
        name: 'Paiements',
        description: 'Gestion des paiements et versements'
      },
      {
        name: 'Statistiques',
        description: 'Statistiques et tableaux de bord'
      },
      {
        name: 'Images',
        description: 'Gestion des images de produits'
      }
    ]
  },
  apis: [
    './src/routes/auth.js',
    './src/routes/categories.js',
    './src/routes/sousCategories.js',
    './src/routes/produits.js',
    './src/routes/fournisseurs.js',
    './src/routes/commandes.js',
    './src/routes/paiements.js',
    './src/routes/stats.js',
    './src/routes/images.js'
  ]
};

// Génération de la spécification Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configuration de l'interface Swagger UI
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none', // Replier tous les endpoints par défaut
    filter: true, // Activer la recherche
    showRequestDuration: true, // Afficher la durée des requêtes
    tryItOutEnabled: true, // Activer le bouton "Try it out"
    requestInterceptor: (req) => {
      // Intercepter les requêtes pour ajouter des headers personnalisés si nécessaire
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
  `,
  customSiteTitle: 'API Quincaillerie Barro et frère - Documentation',
  customfavIcon: '/favicon.ico'
};

// Middleware pour servir la documentation Swagger
const setupSwagger = (app) => {
  // Route pour la spécification JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Route pour l'interface Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  console.log('📚 Documentation Swagger configurée:');
  console.log('   - Interface UI: /api-docs');
  console.log('   - Spécification JSON: /api-docs.json');
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
  setupSwagger
};

