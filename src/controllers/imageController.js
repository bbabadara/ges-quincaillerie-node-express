const { prisma } = require('../config/database');
const { deleteImage, extractPublicIdFromUrl, generateOptimizedUrl, getImageInfo: getCloudinaryImageInfo } = require('../config/cloudinary');

// Uploader une image pour un produit
const uploadProductImage = async (req, res) => {
  try {
    const { code } = req.params;

    if (!req.uploadedImage) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image uploadée'
      });
    }

    // Vérifier que le produit existe
    const produit = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      }
    });

    if (!produit) {
      // Supprimer l'image uploadée si le produit n'existe pas
      if (req.uploadedImage.public_id) {
        await deleteImage(req.uploadedImage.public_id);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // Supprimer l'ancienne image si elle existe
    if (produit.image_url) {
      const oldPublicId = extractPublicIdFromUrl(produit.image_url);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
        } catch (error) {
          console.warn('Impossible de supprimer l\'ancienne image:', error.message);
        }
      }
    }

    // Mettre à jour le produit avec la nouvelle URL d'image
    const produitMisAJour = await prisma.produit.update({
      where: { code: code },
      data: { image_url: req.uploadedImage.url },
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
      data: {
        produit: produitMisAJour,
        image: req.uploadedImage
      },
      message: 'Image uploadée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload d\'image produit:', error);
    
    // Nettoyer l'image uploadée en cas d'erreur
    if (req.uploadedImage && req.uploadedImage.public_id) {
      try {
        await deleteImage(req.uploadedImage.public_id);
      } catch (cleanupError) {
        console.error('Erreur lors du nettoyage de l\'image:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
};

// Supprimer l'image d'un produit
const deleteProductImage = async (req, res) => {
  try {
    const { code } = req.params;

    // Vérifier que le produit existe
    const produit = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      }
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    if (!produit.image_url) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image à supprimer'
      });
    }

    // Extraire le public_id et supprimer de Cloudinary
    const publicId = extractPublicIdFromUrl(produit.image_url);
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.warn('Impossible de supprimer l\'image de Cloudinary:', error.message);
      }
    }

    // Mettre à jour le produit pour enlever l'URL d'image
    const produitMisAJour = await prisma.produit.update({
      where: { code: code },
      data: { image_url: null },
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
      data: produitMisAJour,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'image:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'image'
    });
  }
};

// Obtenir les informations d'une image
const getImageInfo = async (req, res) => {
  try {
    const { code } = req.params;

    const produit = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      },
      select: {
        code: true,
        designation: true,
        image_url: true
      }
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    if (!produit.image_url) {
      return res.status(404).json({
        success: false,
        error: 'Aucune image associée à ce produit'
      });
    }

    const publicId = extractPublicIdFromUrl(produit.image_url);
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'URL d\'image invalide'
      });
    }

    try {
      const imageInfo = await getCloudinaryImageInfo(publicId);
      
      res.status(200).json({
        success: true,
        data: {
          produit: {
            code: produit.code,
            designation: produit.designation
          },
          image: {
            url: produit.image_url,
            public_id: imageInfo.public_id,
            format: imageInfo.format,
            width: imageInfo.width,
            height: imageInfo.height,
            bytes: imageInfo.bytes,
            created_at: imageInfo.created_at
          }
        }
      });
    } catch (cloudinaryError) {
      res.status(200).json({
        success: true,
        data: {
          produit: {
            code: produit.code,
            designation: produit.designation
          },
          image: {
            url: produit.image_url,
            note: 'Informations détaillées non disponibles'
          }
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des infos image:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des informations de l\'image'
    });
  }
};

// Générer une URL optimisée pour une image
const getOptimizedImageUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const { width, height, quality = 'auto:good', format = 'auto' } = req.query;

    const produit = await prisma.produit.findFirst({
      where: { 
        code: code,
        actif: true 
      },
      select: {
        code: true,
        designation: true,
        image_url: true
      }
    });

    if (!produit || !produit.image_url) {
      return res.status(404).json({
        success: false,
        error: 'Produit ou image non trouvé'
      });
    }

    const publicId = extractPublicIdFromUrl(produit.image_url);
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'URL d\'image invalide'
      });
    }

    const transformationOptions = {
      quality,
      fetch_format: format
    };

    if (width) transformationOptions.width = parseInt(width);
    if (height) transformationOptions.height = parseInt(height);
    if (width && height) transformationOptions.crop = 'limit';

    const optimizedUrl = generateOptimizedUrl(publicId, transformationOptions);

    res.status(200).json({
      success: true,
      data: {
        original_url: produit.image_url,
        optimized_url: optimizedUrl,
        transformations: transformationOptions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération d\'URL optimisée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération de l\'URL optimisée'
    });
  }
};

module.exports = {
  uploadProductImage,
  deleteProductImage,
  getImageInfo,
  getOptimizedImageUrl
};

