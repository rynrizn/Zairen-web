/**
 * =====================================================================
 * ⛩️ UPLOADER Y CONVERSOR WEBP AUTOMÁTICO CLOUDINARY // ZAIREN LAB
 * =====================================================================
 */

const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'ds4qnoypm';
const UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'zairen_uploads';

export interface UploadResult {
  success: boolean;
  url: string;
  secureUrl: string;
  publicId?: string;
  error?: string;
}

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
 * Petición interna de subida a Cloudinary
 */
async function sendToCloudinary(
  payload: Blob | File,
  filename: string,
  folder?: string
): Promise<{ ok: boolean; status: number; data: any }> {
  const formData = new FormData();
  formData.append('file', payload, filename);
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
 * Transforma OBLIGATORIAMENTE la imagen a .webp en el cliente antes de enviarla
 * para que a Cloudinary solo ingresen recursos en formato .webp.
 */
export async function uploadImageToCloudinary(
  file: File,
  folderOrOptions?: string | { folder?: string; onProgress?: (percent: number) => void }
): Promise<UploadResult> {
  const folder = typeof folderOrOptions === 'string' ? folderOrOptions : folderOrOptions?.folder;

  try {
    // 1. Transformar automáticamente la imagen a WebP en el navegador
    const webpBlob = await convertToWebP(file);
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';

    // 2. Subir el archivo WebP convertido a Cloudinary
    const resWebP = await sendToCloudinary(webpBlob, cleanFileName, folder);

    if (resWebP.ok) {
      return {
        success: true,
        url: resWebP.data.secure_url || resWebP.data.url,
        secureUrl: resWebP.data.secure_url,
        publicId: resWebP.data.public_id,
      };
    }

    // 3. Manejo detallado y amigable de errores de configuración en Cloudinary
    const rawError = resWebP.data?.error?.message || `Error ${resWebP.status}`;
    let userFriendlyMsg = rawError;

    if (rawError.includes('format') && rawError.includes('not allowed')) {
      userFriendlyMsg = `Cloudinary rechazó el formato .webp. En tu consola de Cloudinary tienes "Allowed formats: auto". Debes cambiarlo a "webp" (o dejarlo vacío) en Settings > Upload > Upload presets > Editar "${UPLOAD_PRESET}".`;
    } else if (rawError.includes('Upload preset must be whitelisted for unsigned uploads')) {
      userFriendlyMsg = `Cloudinary: El preset "${UPLOAD_PRESET}" no está en modo Unsigned. En Cloudinary Console cambia Signing Mode a "Unsigned".`;
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
    console.error('[Cloudinary Upload Exception]', error);
    return {
      success: false,
      url: '',
      secureUrl: '',
      error: error?.message || 'Error al convertir o subir imagen WebP',
    };
  }
}
