/**
 * =====================================================================
 * UPLOADER Y CONVERSOR WEBP AUTOMÁTICO CLOUDINARY // ZAIREN LAB
 * =====================================================================
 * Convierte de forma estricta e incondicional cualquier imagen en el
 * cliente a formato WebP antes de transmitirla a Cloudinary.
 */

const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'ds4qnoypm';
const UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'zairen_uploads';

export interface UploadResult {
  success: boolean;
  url: string;
  secureUrl: string;
  publicId?: string;
  originalSize?: number;
  convertedSize?: number;
  reductionPercentage?: number;
  hash?: string;
  error?: string;
}

/**
 * Calcula el hash SHA-256 de un Blob en el navegador para detectar duplicados
 */
export async function calculateBlobHash(blob: Blob): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${blob.size}-${blob.type}`;
}

/**
 * Convierte obligatoriamente cualquier archivo de imagen (JPG, PNG, HEIC, AVIF, BMP, WEBP)
 * a un Blob estricto de tipo 'image/webp' mediante Canvas en el navegador.
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.85,
  maxWidth: number = 1600
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Si no es un archivo de imagen válido, rechazar
    if (!file.type.startsWith('image/') && !file.name.match(/\.(png|jpe?g|webp|avif|heic|bmp|gif)$/i)) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente manteniendo aspecto si supera el ancho máximo
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto canvas 2D para la conversión a WebP'));
          return;
        }

        // Renderizado optimizado con suavizado bicúbico
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.type === 'image/webp') {
              resolve(blob);
            } else if (blob) {
              // Si toBlob no asignó mime type explícito, asegurar Blob con tipo image/webp
              resolve(new Blob([blob], { type: 'image/webp' }));
            } else {
              reject(new Error('Fallo al codificar la imagen en formato WebP'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('No se pudo decodificar la imagen para su conversión'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo desde el dispositivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Petición interna de subida a Cloudinary con verificación estricta de formato WebP
 */
async function sendToCloudinary(
  payload: Blob,
  filename: string,
  folder?: string
): Promise<{ ok: boolean; status: number; data: any }> {
  // Validación de seguridad estricta: Únicamente permitir envío de Blobs 'image/webp'
  if (payload.type !== 'image/webp') {
    throw new Error('Seguridad: Solo se permite enviar archivos WebP a Cloudinary.');
  }

  // Garantizar que la extensión sea forzosamente .webp
  const cleanFilename = filename.toLowerCase().endsWith('.webp')
    ? filename
    : filename.replace(/\.[^/.]+$/, '') + '.webp';

  const formData = new FormData();
  formData.append('file', payload, cleanFilename);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

/**
 * Sube una imagen directamente a Cloudinary sin firma (Unsigned).
 * Convierte FORZOSAMENTE la imagen a formato .webp antes de transmitirla,
 * garantizando que en Cloudinary solo existan archivos WebP optimizados.
 */
export async function uploadImageToCloudinary(
  file: File,
  folderOrOptions?: string | { folder?: string; onProgress?: (percent: number) => void }
): Promise<UploadResult> {
  const folder = typeof folderOrOptions === 'string' ? folderOrOptions : folderOrOptions?.folder;
  const originalSize = file.size;

  try {
    // 1. Transformación obligatoria a WebP en el navegador
    const webpBlob = await convertToWebP(file);
    const convertedSize = webpBlob.size;
    const reduction = Math.max(0, Math.round(((originalSize - convertedSize) / originalSize) * 100));
    const blobHash = await calculateBlobHash(webpBlob);

    const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';

    // 2. Transmisión del Blob WebP verificado a Cloudinary
    const resWebP = await sendToCloudinary(webpBlob, cleanFileName, folder);

    if (resWebP.ok) {
      return {
        success: true,
        url: resWebP.data.secure_url || resWebP.data.url,
        secureUrl: resWebP.data.secure_url,
        publicId: resWebP.data.public_id,
        originalSize,
        convertedSize,
        reductionPercentage: reduction,
        hash: blobHash,
      };
    }

    // 3. Manejo explicativo de configuraciones de Cloudinary
    const rawError = resWebP.data?.error?.message || `Error ${resWebP.status}`;
    let userFriendlyMsg = rawError;

    if (rawError.includes('format') && rawError.includes('not allowed')) {
      userFriendlyMsg = `Cloudinary rechazó el formato .webp. En tu consola Cloudinary debes habilitar formato webp en Settings > Upload > Upload presets > "${UPLOAD_PRESET}".`;
    } else if (rawError.includes('Upload preset must be whitelisted for unsigned uploads')) {
      userFriendlyMsg = `Cloudinary: El preset "${UPLOAD_PRESET}" no está en modo Unsigned.`;
    } else if (rawError.includes('Upload preset not found')) {
      userFriendlyMsg = `Cloudinary: No se encontró el preset "${UPLOAD_PRESET}".`;
    }

    console.error('[Cloudinary Upload Error]', userFriendlyMsg);
    return {
      success: false,
      url: '',
      secureUrl: '',
      error: userFriendlyMsg,
    };
  } catch (error: any) {
    console.error('[Cloudinary WebP Pipeline Exception]', error);
    return {
      success: false,
      url: '',
      secureUrl: '',
      error: error?.message || 'Error al procesar y convertir imagen a WebP',
    };
  }
}
