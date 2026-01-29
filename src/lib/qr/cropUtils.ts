import type { LogoShape } from './types';

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Loads an image from a src URL and returns the HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Crops, shape-masks, and optionally backgrounds an image using canvas.
 *
 * @param imageSrc - Source URL or data URL of the image
 * @param pixelCrop - The crop area in pixels (from react-easy-crop)
 * @param shape - The mask shape to apply ('square' | 'rounded' | 'circle')
 * @param background - Optional background fill { enabled, color }
 * @returns PNG Blob of the processed image
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
  shape: LogoShape = 'square',
  background?: { enabled: boolean; color: string }
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const size = Math.max(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  // Fill background if enabled
  if (background?.enabled && background.color) {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, size, size);
  }

  // Apply shape clipping
  ctx.save();
  ctx.beginPath();

  switch (shape) {
    case 'circle':
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      break;
    case 'rounded': {
      const radius = size * 0.15;
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      break;
    }
    case 'square':
    default:
      ctx.rect(0, 0, size, size);
      break;
  }

  ctx.closePath();
  ctx.clip();

  // Draw the cropped portion of the image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Creates an object URL from a File, handling SVGs by rasterizing first.
 */
export async function createImageUrl(file: File): Promise<string> {
  if (file.type === 'image/svg+xml') {
    // Rasterize SVG to a data URL for the cropper
    const svgText = await file.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const img = await loadImage(url);
      const canvas = document.createElement('canvas');
      // Rasterize at a reasonable size
      const size = Math.max(img.naturalWidth || 512, img.naturalHeight || 512, 512);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return URL.createObjectURL(file);
}
