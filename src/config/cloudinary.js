const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Vérifier la configuration
const verifyCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    console.warn('⚠️  Configuration Cloudinary incomplète. Certaines fonctionnalités d\'upload d\'images peuvent ne pas fonctionner.');
    return false;
  }
  
  console.log('✅ Configuration Cloudinary validée');
  return true;
};

// Options d'upload par défaut pour les produits
const getProductUploadOptions = (productCode) => {
  return {
    folder: 'quincaillerie/produits',
    public_id: `produit_${productCode}_${Date.now()}`,
    resource_type: 'image',
    format: 'jpg',
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    tags: ['produit', 'quincaillerie']
  };
};

// Uploader une image
const uploadImage = async (fileBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          ...options,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('Erreur upload Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw new Error('Erreur lors de l\'upload de l\'image');
  }
};

// Supprimer une image
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw new Error('Erreur lors de la suppression de l\'image');
  }
};

// Extraire le public_id d'une URL Cloudinary
const extractPublicIdFromUrl = (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return null;
    }
    
    // Exemple d'URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      return null;
    }
    
    // Récupérer la partie après 'upload/v{version}/'
    const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
    
    // Enlever l'extension du fichier
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du public_id:', error);
    return null;
  }
};

// Générer une URL optimisée
const generateOptimizedUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options
    });
  } catch (error) {
    console.error('Erreur lors de la génération d\'URL:', error);
    return null;
  }
};

// Obtenir les informations d'une image
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos image:', error);
    throw new Error('Erreur lors de la récupération des informations de l\'image');
  }
};

module.exports = {
  cloudinary,
  verifyCloudinaryConfig,
  getProductUploadOptions,
  uploadImage,
  deleteImage,
  extractPublicIdFromUrl,
  generateOptimizedUrl,
  getImageInfo
};

