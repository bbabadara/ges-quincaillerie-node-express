const { prisma } = require('../config/database');

// Obtenir tous les produits actifs
const getProduits = async (req, res) => {
  try {
    const { sous_categorie_id, categorie_id, search } = req.query;
    
    let whereClause = { actif: true };
    
    if (sous_categorie_id) {
      whereClause.sous_categorie_id = parseInt(sous_categorie_id);
    }
    
    if (categorie_id) {
      whereClause.sous_categorie = {
        categorie_id: parseInt(categorie_id)
      };
    }
    
    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } }
      ];
    }

    const produits = await prisma.produit.findMany({
      where: whereClause,
      include: {
        sous_categorie: {
          include: {
            categorie: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        }
      },
      orderBy: { designation: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: produits,
      count: produits.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des produits'
    });
  }
};

// Obtenir un produit par code
const getProduitByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const produit = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      },
      include: {
        sous_categorie: {
          include: {
            categorie: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        },
        lignes_commande: {
          include: {
            commande: {
              select: {
                id: true,
                date_commande: true,
                statut: true,
                fournisseur: {
                  select: {
                    nom: true
                  }
                }
              }
            }
          },
          orderBy: {
            commande: {
              date_commande: 'desc'
            }
          },
          take: 5 // Dernières 5 commandes
        }
      }
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: produit
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du produit'
    });
  }
};

// Créer un nouveau produit
const createProduit = async (req, res) => {
  try {
    const { code, designation, quantite_en_stock, prix_unitaire, image_url, sous_categorie_id } = req.body;

    // Validation des données
    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le code du produit est requis'
      });
    }

    if (!designation || designation.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'La désignation du produit est requise'
      });
    }

    if (!prix_unitaire || prix_unitaire <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Le prix unitaire doit être supérieur à 0'
      });
    }

    if (!sous_categorie_id) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID de la sous-catégorie est requis'
      });
    }

    // Vérifier que la sous-catégorie existe
    const sousCategorieExistante = await prisma.sousCategorie.findFirst({
      where: { 
        id: parseInt(sous_categorie_id),
        actif: true 
      }
    });

    if (!sousCategorieExistante) {
      return res.status(400).json({
        success: false,
        error: 'Sous-catégorie non trouvée'
      });
    }

    const nouveauProduit = await prisma.produit.create({
      data: {
        code: code.trim().toUpperCase(),
        designation: designation.trim(),
        quantite_en_stock: parseInt(quantite_en_stock) || 0,
        prix_unitaire: parseFloat(prix_unitaire),
        image_url: image_url?.trim() || null,
        sous_categorie_id: parseInt(sous_categorie_id)
      },
      include: {
        sous_categorie: {
          include: {
            categorie: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: nouveauProduit,
      message: 'Produit créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Un produit avec ce code existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du produit'
    });
  }
};

// Mettre à jour un produit
const updateProduit = async (req, res) => {
  try {
    const { code } = req.params;
    const { designation, quantite_en_stock, prix_unitaire, image_url, sous_categorie_id } = req.body;

    // Vérifier si le produit existe
    const produitExistant = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      }
    });

    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Validation des données
    if (!designation || designation.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'La désignation du produit est requise'
      });
    }

    if (!prix_unitaire || prix_unitaire <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Le prix unitaire doit être supérieur à 0'
      });
    }

    const updateData = {
      designation: designation.trim(),
      quantite_en_stock: parseInt(quantite_en_stock) || 0,
      prix_unitaire: parseFloat(prix_unitaire),
      image_url: image_url?.trim() || null
    };

    // Si une nouvelle sous-catégorie est spécifiée, vérifier qu'elle existe
    if (sous_categorie_id && sous_categorie_id !== produitExistant.sous_categorie_id) {
      const sousCategorieExistante = await prisma.sousCategorie.findFirst({
        where: { 
          id: parseInt(sous_categorie_id),
          actif: true 
        }
      });

      if (!sousCategorieExistante) {
        return res.status(400).json({
          success: false,
          error: 'Sous-catégorie non trouvée'
        });
      }

      updateData.sous_categorie_id = parseInt(sous_categorie_id);
    }

    const produitModifie = await prisma.produit.update({
      where: { code: code },
      data: updateData,
      include: {
        sous_categorie: {
          include: {
            categorie: {
              select: {
                id: true,
                nom: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: produitModifie,
      message: 'Produit modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du produit'
    });
  }
};

// Archiver un produit (suppression logique)
const deleteProduit = async (req, res) => {
  try {
    const { code } = req.params;

    // Vérifier si le produit existe
    const produitExistant = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      }
    });

    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Vérifier s'il y a des commandes en cours pour ce produit
    const commandesEnCours = await prisma.ligneCommande.findMany({
      where: {
        produit_code: code,
        commande: {
          statut: {
            in: ['ENCOURS', 'LIVRE']
          }
        }
      }
    });

    if (commandesEnCours.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Impossible d\'archiver ce produit car il est présent dans des commandes en cours'
      });
    }

    // Archiver le produit
    await prisma.produit.update({
      where: { code: code },
      data: { actif: false }
    });

    res.status(200).json({
      success: true,
      message: 'Produit archivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage du produit:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'archivage du produit'
    });
  }
};

// Mettre à jour le stock d'un produit
const updateStock = async (req, res) => {
  try {
    const { code } = req.params;
    const { quantite_en_stock } = req.body;

    // Validation
    if (quantite_en_stock === undefined || quantite_en_stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'La quantité en stock doit être un nombre positif ou zéro'
      });
    }

    // Vérifier si le produit existe
    const produitExistant = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      }
    });

    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    const produitModifie = await prisma.produit.update({
      where: { code: code },
      data: { quantite_en_stock: parseInt(quantite_en_stock) }
    });

    res.status(200).json({
      success: true,
      data: produitModifie,
      message: 'Stock mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du stock'
    });
  }
};

module.exports = {
  getProduits,
  getProduitByCode,
  createProduit,
  updateProduit,
  deleteProduit,
  updateStock
};

