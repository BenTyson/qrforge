import QRCode from 'qrcode';
import type { QRContent, QRStyleOptions } from './types';
import { contentToString } from './generator';

/**
 * Server-side QR code generation (no browser APIs)
 */

/**
 * Generates a QR code as a PNG buffer (for server-side use)
 */
export async function generateQRPNG(
  content: QRContent,
  style: Partial<QRStyleOptions> = {}
): Promise<Buffer> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const options = {
    errorCorrectionLevel: style.errorCorrectionLevel || 'M',
    margin: style.margin ?? 2,
    width: style.width || 512,
    color: {
      dark: style.foregroundColor || '#000000',
      light: style.backgroundColor || '#ffffff',
    },
  };

  const buffer = await QRCode.toBuffer(text, options);
  return buffer;
}

/**
 * Generates a QR code as an SVG string (for server-side use)
 */
export async function generateQRSVGServer(
  content: QRContent,
  style: Partial<QRStyleOptions> = {}
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const svg = await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: style.errorCorrectionLevel || 'M',
    margin: style.margin ?? 2,
    width: style.width || 512,
    color: {
      dark: style.foregroundColor || '#000000',
      light: style.backgroundColor || '#ffffff',
    },
  });

  return svg;
}

/**
 * Generates a QR code as a data URL (PNG base64)
 */
export async function generateQRDataURLServer(
  content: QRContent,
  style: Partial<QRStyleOptions> = {}
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const dataURL = await QRCode.toDataURL(text, {
    errorCorrectionLevel: style.errorCorrectionLevel || 'M',
    margin: style.margin ?? 2,
    width: style.width || 512,
    color: {
      dark: style.foregroundColor || '#000000',
      light: style.backgroundColor || '#ffffff',
    },
  });

  return dataURL;
}
