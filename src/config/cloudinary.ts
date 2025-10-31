// Configuración de Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: 'dzgawfylm',
  uploadPreset: 'northpadel_unsigned', // Lo crearemos en Cloudinary
  apiKey: 'CLOUDINARY_API_KEY', // Placeholder - será reemplazado por el backend
  apiSecret: 'CLOUDINARY_API_SECRET', // Placeholder - será reemplazado por el backend
};

// URL base para subir imágenes
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

/**
 * Obtiene la firma de Cloudinary desde el backend
 */
export const getCloudinarySignature = async (): Promise<{ signature: string; timestamp: number; api_key: string }> => {
  try {
    const response = await fetch('http://192.168.100.2:3000/api/cloudinary/signature', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener firma de Cloudinary');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getCloudinarySignature:', error);
    throw error;
  }
};