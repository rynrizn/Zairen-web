/**
 * =====================================================================
 * ⛩️ UPLOADER Y CONVERSOR WEBP AUTOMÁTICO CLOUDINARY // ZAIREN LAB
 * =====================================================================
 */

const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'ds4qnoypm';
const UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'zairen_uploads';

/**
 * Convierte cualquier archivo de imagen (JPG, PNG, HEIC, etc.) a formato WebP
 * en el navegador del cliente antes de subirlo, reduciendo hasta un 90% el peso.
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.85,
  maxWidth: number = 1600
): Promise<Blob> {
  // Si ya es un webp ligero de menos de 800KB, no es necesario recodificar
  if (file.type === 'image/webp' && file.size < 800 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente si supera el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto canvas 2D'));
          return;
        }

        // Dibujar con suavizado de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Fallo al convertir imagen a WebP'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('No se pudo procesar el archivo de imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una imagen directamente a Cloudinary sin firma (Unsigned).
 * Retorna la URL HTTPS segura y el public_id.
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; secureUrl: string; publicId: string }> {
  try {
    // 1. Convertir a WebP
    const webpBlob = await convertToWebP(file);

    // 2. Preparar FormData
    const formData = new FormData();
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
    formData.append('file', webpBlob, cleanFileName);
    formData.append('upload_preset', UPLOAD_PRESET);

    // 3. Petición a la API REST de Cloudinary
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Error en Cloudinary (${response.status})`);
    }

    const data = await response.json();
    return {
      url: data.url,
      secureUrl: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error: any) {
    console.error('[Cloudinary Upload Error]', error);
    throw error;
  }
}
