const { PrismaClient } = require('@prisma/client');

// Instance unique de Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Fonction pour connecter à la base de données
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

// Fonction pour déconnecter de la base de données
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Déconnexion de la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  }
}

// Gestion propre de l'arrêt de l'application
process.on('SIGINT', async () => {
  console.log('\n🔄 Arrêt de l\'application en cours...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Arrêt de l\'application en cours...');
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};

