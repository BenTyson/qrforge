import QRCode from 'qrcode';
import type { QRContent, QRStyleOptions, DEFAULT_STYLE } from './types';

/**
 * Converts QR content to a string that can be encoded in a QR code
 */
export function contentToString(content: QRContent): string {
  switch (content.type) {
    case 'url':
      return content.url;

    case 'text':
      return content.text;

    case 'wifi':
      // WiFi QR code format: WIFI:T:WPA;S:ssid;P:password;H:hidden;;
      const hidden = content.hidden ? 'true' : 'false';
      return `WIFI:T:${content.encryption};S:${escapeWiFi(content.ssid)};P:${escapeWiFi(content.password)};H:${hidden};;`;

    case 'vcard':
      return generateVCard(content);

    case 'email':
      let mailto = `mailto:${content.email}`;
      const params: string[] = [];
      if (content.subject) params.push(`subject=${encodeURIComponent(content.subject)}`);
      if (content.body) params.push(`body=${encodeURIComponent(content.body)}`);
      if (params.length > 0) mailto += `?${params.join('&')}`;
      return mailto;

    case 'phone':
      return `tel:${content.phone}`;

    case 'sms':
      let sms = `sms:${content.phone}`;
      if (content.message) {
        sms += `?body=${encodeURIComponent(content.message)}`;
      }
      return sms;

    default:
      return '';
  }
}

/**
 * Escapes special characters in WiFi SSID and password
 */
function escapeWiFi(str: string): string {
  return str.replace(/[\\;,:]/g, (match) => `\\${match}`);
}

/**
 * Generates a vCard 3.0 format string
 */
function generateVCard(content: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  url?: string;
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${content.lastName};${content.firstName};;;`,
    `FN:${content.firstName} ${content.lastName}`,
  ];

  if (content.organization) {
    lines.push(`ORG:${content.organization}`);
  }
  if (content.title) {
    lines.push(`TITLE:${content.title}`);
  }
  if (content.phone) {
    lines.push(`TEL:${content.phone}`);
  }
  if (content.email) {
    lines.push(`EMAIL:${content.email}`);
  }
  if (content.url) {
    lines.push(`URL:${content.url}`);
  }

  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Loads an image from a URL and returns it as an HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = url;
  });
}

/**
 * Generates a QR code as a Data URL (base64 encoded image)
 * Supports optional logo overlay in the center
 */
export async function generateQRDataURL(
  content: QRContent,
  style: QRStyleOptions = {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  }
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  // If no logo, use the simple method
  if (!style.logoUrl) {
    const dataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: style.errorCorrectionLevel,
      margin: style.margin,
      width: style.width,
      color: {
        dark: style.foregroundColor,
        light: style.backgroundColor,
      },
    });
    return dataURL;
  }

  // With logo: generate to canvas, draw logo, export
  const canvas = document.createElement('canvas');
  canvas.width = style.width;
  canvas.height = style.width;

  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: style.errorCorrectionLevel,
    margin: style.margin,
    width: style.width,
    color: {
      dark: style.foregroundColor,
      light: style.backgroundColor,
    },
  });

  // Load and draw logo
  try {
    const logo = await loadImage(style.logoUrl);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const logoSizePercent = style.logoSize || 20;
      const logoSize = (style.width * logoSizePercent) / 100;
      const logoX = (style.width - logoSize) / 2;
      const logoY = (style.width - logoSize) / 2;

      // Draw white background circle behind logo for contrast
      const padding = logoSize * 0.1;
      ctx.fillStyle = style.backgroundColor;
      ctx.beginPath();
      ctx.arc(
        style.width / 2,
        style.width / 2,
        logoSize / 2 + padding,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw the logo
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    }
  } catch (error) {
    console.error('Failed to draw logo:', error);
    // Continue without logo if it fails to load
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates a QR code as an SVG string
 */
export async function generateQRSVG(
  content: QRContent,
  style: QRStyleOptions = {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  }
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const svg = await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: style.errorCorrectionLevel,
    margin: style.margin,
    width: style.width,
    color: {
      dark: style.foregroundColor,
      light: style.backgroundColor,
    },
  });

  return svg;
}

/**
 * Generates a QR code as a Canvas (for browser use)
 */
export async function generateQRCanvas(
  canvas: HTMLCanvasElement,
  content: QRContent,
  style: QRStyleOptions = {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  }
): Promise<void> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: style.errorCorrectionLevel,
    margin: style.margin,
    width: style.width,
    color: {
      dark: style.foregroundColor,
      light: style.backgroundColor,
    },
  });
}

/**
 * Downloads a QR code as PNG
 */
export function downloadQRPNG(dataURL: string, filename: string = 'qrcode'): void {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a QR code as SVG
 */
export function downloadQRSVG(svgString: string, filename: string = 'qrcode'): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates if content is valid for QR generation
 */
export function validateContent(content: QRContent): { valid: boolean; error?: string } {
  switch (content.type) {
    case 'url':
      if (!content.url) return { valid: false, error: 'URL is required' };
      try {
        new URL(content.url);
        return { valid: true };
      } catch {
        // Allow URLs without protocol - we'll add https
        if (content.url.includes('.')) {
          return { valid: true };
        }
        return { valid: false, error: 'Invalid URL format' };
      }

    case 'text':
      if (!content.text) return { valid: false, error: 'Text is required' };
      if (content.text.length > 2953) return { valid: false, error: 'Text too long (max 2953 characters)' };
      return { valid: true };

    case 'wifi':
      if (!content.ssid) return { valid: false, error: 'Network name is required' };
      return { valid: true };

    case 'vcard':
      if (!content.firstName && !content.lastName) {
        return { valid: false, error: 'Name is required' };
      }
      return { valid: true };

    case 'email':
      if (!content.email) return { valid: false, error: 'Email is required' };
      if (!content.email.includes('@')) return { valid: false, error: 'Invalid email format' };
      return { valid: true };

    case 'phone':
      if (!content.phone) return { valid: false, error: 'Phone number is required' };
      return { valid: true };

    case 'sms':
      if (!content.phone) return { valid: false, error: 'Phone number is required' };
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown content type' };
  }
}
