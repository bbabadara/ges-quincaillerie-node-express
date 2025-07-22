const multer = require('multer');
const { uploadImage, getProductUploadOptions } = require('../config/cloudinary');

// Configuration Multer pour stocker en mémoire
const storage = multer.memoryStorage();

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés pour les images
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les formats JPEG, PNG, GIF et WebP sont acceptés.'), false);
  }
};

// Configuration Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1 // Un seul fichier à la fois
  }
});

// Middleware pour uploader une image de produit
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // Pas de fichier, continuer sans erreur
    }

    const { code } = req.params || req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code produit requis pour l\'upload d\'image'
      });
    }

    // Options d'upload spécifiques au produit
    const uploadOptions = getProductUploadOptions(code);

    // Upload vers Cloudinary
    const result = await uploadImage(req.file.buffer, uploadOptions);

    // Ajouter l'URL de l'image à la requête
    req.uploadedImage = {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };

    next();
  } catch (error) {
    console.error('Erreur lors de l\'upload d\'image:', error);
    
    if (error.message.includes('Type de fichier non autorisé')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        error: 'Fichier trop volumineux. Taille maximale autorisée: 5MB'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
};

// Middleware pour gérer les erreurs Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Fichier trop volumineux. Taille maximale autorisée: 5MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Trop de fichiers. Un seul fichier autorisé à la fois'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Champ de fichier inattendu'
      });
    }
  }
  
  if (error.message.includes('Type de fichier non autorisé')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};

// Middleware combiné pour l'upload d'image de produit
const uploadSingleProductImage = [
  upload.single('image'),
  handleMulterError,
  uploadProductImage
];

// Middleware pour valider la présence d'une image
const requireImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Image requise'
    });
  }
  next();
};

// Middleware pour valider les dimensions d'image (optionnel)
const validateImageDimensions = (minWidth = 100, minHeight = 100, maxWidth = 2000, maxHeight = 2000) => {
  return (req, res, next) => {
    if (!req.uploadedImage) {
      return next();
    }

    const { width, height } = req.uploadedImage;

    if (width < minWidth || height < minHeight) {
      return res.status(400).json({
        success: false,
        error: `Image trop petite. Dimensions minimales: ${minWidth}x${minHeight}px`
      });
    }

    if (width > maxWidth || height > maxHeight) {
      return res.status(400).json({
        success: false,
        error: `Image trop grande. Dimensions maximales: ${maxWidth}x${maxHeight}px`
      });
    }

    next();
  };
};

module.exports = {
  upload,
  uploadProductImage,
  uploadSingleProductImage,
  handleMulterError,
  requireImage,
  validateImageDimensions
};

