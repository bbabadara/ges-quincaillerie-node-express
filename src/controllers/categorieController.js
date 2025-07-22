const { prisma } = require('../config/database');

// Obtenir toutes les catégories actives
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      where: { actif: true },
      include: {
        sous_categories: {
          where: { actif: true },
          select: {
            id: true,
            nom: true,
            description: true
          }
        }
      },
      orderBy: { nom: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories'
    });
  }
};

// Obtenir une catégorie par ID
const getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categorie = await prisma.categorie.findFirst({
      where: { 
        id: parseInt(id),
        actif: true 
      },
      include: {
        sous_categories: {
          where: { actif: true },
          include: {
            produits: {
              where: { actif: true },
              select: {
                code: true,
                designation: true,
                quantite_en_stock: true,
                prix_unitaire: true
              }
            }
          }
        }
      }
    });

    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la catégorie'
    });
  }
};

// Créer une nouvelle catégorie
const createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;

    // Validation des données
    if (!nom || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la catégorie est requis'
      });
    }

    const nouvelleCategorie = await prisma.categorie.create({
      data: {
        nom: nom.trim(),
        description: description?.trim() || null
      }
    });

    res.status(201).json({
      success: true,
      data: nouvelleCategorie,
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Une catégorie avec ce nom existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la catégorie'
    });
  }
};

// Mettre à jour une catégorie
const updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description } = req.body;

    // Vérifier si la catégorie existe
    const categorieExistante = await prisma.categorie.findFirst({
      where: { 
        id: parseInt(id),
        actif: true 
      }
    });

    if (!categorieExistante) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    // Validation des données
    if (!nom || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la catégorie est requis'
      });
    }

    const categorieModifiee = await prisma.categorie.update({
      where: { id: parseInt(id) },
      data: {
        nom: nom.trim(),
        description: description?.trim() || null
      }
    });

    res.status(200).json({
      success: true,
      data: categorieModifiee,
      message: 'Catégorie modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Une catégorie avec ce nom existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de la catégorie'
    });
  }
};

// Archiver une catégorie (suppression logique)
const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie existe
    const categorieExistante = await prisma.categorie.findFirst({
      where: { 
        id: parseInt(id),
        actif: true 
      }
    });

    if (!categorieExistante) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    // Archiver la catégorie et ses sous-catégories
    await prisma.$transaction(async (tx) => {
      // Archiver les produits des sous-catégories
      await tx.produit.updateMany({
        where: {
          sous_categorie: {
            categorie_id: parseInt(id)
          }
        },
        data: { actif: false }
      });

      // Archiver les sous-catégories
      await tx.sousCategorie.updateMany({
        where: { categorie_id: parseInt(id) },
        data: { actif: false }
      });

      // Archiver la catégorie
      await tx.categorie.update({
        where: { id: parseInt(id) },
        data: { actif: false }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Catégorie archivée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la catégorie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'archivage de la catégorie'
    });
  }
};

module.exports = {
  getCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie
};

