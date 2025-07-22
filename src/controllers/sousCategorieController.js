const { prisma } = require('../config/database');

// Obtenir toutes les sous-catégories actives
const getSousCategories = async (req, res) => {
  try {
    const { categorie_id } = req.query;
    
    const whereClause = { actif: true };
    if (categorie_id) {
      whereClause.categorie_id = parseInt(categorie_id);
    }

    const sousCategories = await prisma.sousCategorie.findMany({
      where: whereClause,
      include: {
        categorie: {
          select: {
            id: true,
            nom: true
          }
        },
        produits: {
          where: { actif: true },
          select: {
            code: true,
            designation: true,
            quantite_en_stock: true,
            prix_unitaire: true
          }
        }
      },
      orderBy: { nom: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: sousCategories,
      count: sousCategories.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des sous-catégories'
    });
  }
};

// Obtenir une sous-catégorie par ID
const getSousCategorieById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sousCategorie = await prisma.sousCategorie.findFirst({
      where: { 
        id: parseInt(id),
        actif: true 
      },
      include: {
        categorie: {
          select: {
            id: true,
            nom: true,
            description: true
          }
        },
        produits: {
          where: { actif: true }
        }
      }
    });

    if (!sousCategorie) {
      return res.status(404).json({
        success: false,
        error: 'Sous-catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: sousCategorie
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la sous-catégorie'
    });
  }
};

// Créer une nouvelle sous-catégorie
const createSousCategorie = async (req, res) => {
  try {
    const { nom, description, categorie_id } = req.body;

    // Validation des données
    if (!nom || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la sous-catégorie est requis'
      });
    }

    if (!categorie_id) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID de la catégorie est requis'
      });
    }

    // Vérifier que la catégorie existe
    const categorieExistante = await prisma.categorie.findFirst({
      where: { 
        id: parseInt(categorie_id),
        actif: true 
      }
    });

    if (!categorieExistante) {
      return res.status(400).json({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }

    const nouvelleSousCategorie = await prisma.sousCategorie.create({
      data: {
        nom: nom.trim(),
        description: description?.trim() || null,
        categorie_id: parseInt(categorie_id)
      },
      include: {
        categorie: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: nouvelleSousCategorie,
      message: 'Sous-catégorie créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la sous-catégorie:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Une sous-catégorie avec ce nom existe déjà dans cette catégorie'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la sous-catégorie'
    });
  }
};

// Mettre à jour une sous-catégorie
const updateSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, categorie_id } = req.body;

    // Vérifier si la sous-catégorie existe
    const sousCategorieExistante = await prisma.sousCategorie.findFirst({
      where: { 
        id: parseInt(id),
        actif: true 
      }
    });

    if (!sousCategorieExistante) {
      return res.status(404).json({
        success: false,
        error: 'Sous-catégorie non trouvée'
      });
    }

    // Validation des données
    if (!nom || nom.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom de la sous-catégorie est requis'
      });
    }

    const updateData = {
      nom: nom.trim(),
      description: description?.trim() || null
    };

    // Si une nouvelle catégorie est spécifiée, vérifier qu'elle existe
    if (categorie_id && categorie_id !== sousCategorieExistante.categorie_id) {
      const categorieExistante = await prisma.categorie.findFirst({
        where: { 
          id: parseInt(categorie_id),
          actif: true 
        }
      });

      if (!categorieExistante) {
        return res.status(400).json({
          success: false,
          error: 'Catégorie non trouvée'
        });
      }

      updateData.categorie_id = parseInt(categorie_id);
    }

    const sousCategorieModifiee = await prisma.sousCategorie.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        categorie: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: sousCategorieModifiee,
      message: 'Sous-catégorie modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la sous-catégorie:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Une sous-catégorie avec ce nom existe déjà dans cette catégorie'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de la sous-catégorie'
    });
  }
};

// Archiver une sous-catégorie (suppression logique)
const deleteSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la sous-catégorie existe
    const sousCategorieExistante = await prisma.sousCategorie.findFirst({
      where: { 
        id: parseInt(id),
        actif: true 
      }
    });

    if (!sousCategorieExistante) {
      return res.status(404).json({
        success: false,
        error: 'Sous-catégorie non trouvée'
      });
    }

    // Archiver la sous-catégorie et ses produits
    await prisma.$transaction(async (tx) => {
      // Archiver les produits de cette sous-catégorie
      await tx.produit.updateMany({
        where: { sous_categorie_id: parseInt(id) },
        data: { actif: false }
      });

      // Archiver la sous-catégorie
      await tx.sousCategorie.update({
        where: { id: parseInt(id) },
        data: { actif: false }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Sous-catégorie archivée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'archivage de la sous-catégorie'
    });
  }
};

module.exports = {
  getSousCategories,
  getSousCategorieById,
  createSousCategorie,
  updateSousCategorie,
  deleteSousCategorie
};

