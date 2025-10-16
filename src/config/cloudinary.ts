// Configuración de Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: 'dzgawfylm',
  uploadPreset: 'northpadel_unsigned', // Lo crearemos en Cloudinary
};

// URL base para subir imágenes
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;