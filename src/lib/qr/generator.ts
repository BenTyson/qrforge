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

    // === Simple URL Types ===
    case 'whatsapp':
      // WhatsApp deep link format: wa.me/{phone}?text={message}
      let waUrl = `https://wa.me/${content.phone.replace(/\D/g, '')}`;
      if (content.message) {
        waUrl += `?text=${encodeURIComponent(content.message)}`;
      }
      return waUrl;

    case 'facebook':
      return content.profileUrl;

    case 'instagram':
      // Remove @ if present and build Instagram URL
      const username = content.username.replace(/^@/, '');
      return `https://instagram.com/${username}`;

    case 'apps':
      // Return fallback URL or first available store URL
      // For smart redirects, this will point to a landing page
      return content.fallbackUrl || content.appStoreUrl || content.playStoreUrl || '';

    // === File Upload & Landing Page Types ===
    // These types always use dynamic QR codes with landing pages
    // The QR code points to /r/[shortCode] which handles the redirect
    // For preview purposes, we return a placeholder URL
    case 'pdf':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'images':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'video':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'mp3':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'menu':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'business':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'links':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'coupon':
      return `https://qrwolf.com/preview/${content.type}`;
    case 'social':
      return `https://qrwolf.com/preview/${content.type}`;

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
 * Parses a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Interpolates between two colors based on a position (0-1)
 */
function interpolateColor(
  start: { r: number; g: number; b: number },
  end: { r: number; g: number; b: number },
  t: number
): { r: number; g: number; b: number } {
  return {
    r: Math.round(start.r + (end.r - start.r) * t),
    g: Math.round(start.g + (end.g - start.g) * t),
    b: Math.round(start.b + (end.b - start.b) * t),
  };
}

/**
 * Applies a gradient to the dark pixels of a QR code canvas
 */
function applyGradientToCanvas(
  canvas: HTMLCanvasElement,
  gradient: { type: 'linear' | 'radial'; startColor: string; endColor: string; angle?: number },
  backgroundColor: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const startRgb = hexToRgb(gradient.startColor);
  const endRgb = hexToRgb(gradient.endColor);
  const bgRgb = hexToRgb(backgroundColor);

  // Determine if a pixel is "dark" (part of the QR code)
  const isDark = (r: number, g: number, b: number) => {
    const brightness = (r + g + b) / 3;
    const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / 3;
    return brightness < bgBrightness - 50 || (bgBrightness > 200 && brightness < 128);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (isDark(r, g, b)) {
        let t: number;

        if (gradient.type === 'radial') {
          // Radial gradient from center
          const centerX = width / 2;
          const centerY = height / 2;
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
          const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          t = dist / maxDist;
        } else {
          // Linear gradient based on angle
          const angle = ((gradient.angle || 0) * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          // Project point onto gradient line
          const proj = (x * cos + y * sin) / (width * Math.abs(cos) + height * Math.abs(sin));
          t = Math.max(0, Math.min(1, (proj + 0.5)));
        }

        const color = interpolateColor(startRgb, endRgb, t);
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
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

  const hasGradient = style.gradient?.enabled;
  const hasLogo = !!style.logoUrl;

  // If no logo and no gradient, use the simple method
  if (!hasLogo && !hasGradient) {
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

  // With logo or gradient: generate to canvas, apply effects, export
  const canvas = document.createElement('canvas');
  canvas.width = style.width;
  canvas.height = style.width;

  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: style.errorCorrectionLevel,
    margin: style.margin,
    width: style.width,
    color: {
      dark: hasGradient ? '#000000' : style.foregroundColor, // Use black for gradient processing
      light: style.backgroundColor,
    },
  });

  // Apply gradient if enabled
  if (hasGradient && style.gradient) {
    applyGradientToCanvas(canvas, style.gradient, style.backgroundColor);
  }

  // Load and draw logo if present
  if (hasLogo && style.logoUrl) {
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

    // === Simple URL Types ===
    case 'whatsapp':
      if (!content.phone) return { valid: false, error: 'WhatsApp number is required' };
      return { valid: true };

    case 'facebook':
      if (!content.profileUrl) return { valid: false, error: 'Facebook URL is required' };
      if (!content.profileUrl.includes('facebook.com') && !content.profileUrl.includes('fb.com')) {
        return { valid: false, error: 'Invalid Facebook URL' };
      }
      return { valid: true };

    case 'instagram':
      if (!content.username) return { valid: false, error: 'Instagram username is required' };
      return { valid: true };

    case 'apps':
      if (!content.appStoreUrl && !content.playStoreUrl && !content.fallbackUrl) {
        return { valid: false, error: 'At least one app store URL or fallback URL is required' };
      }
      return { valid: true };

    // === File Upload Types ===
    case 'pdf':
      if (!content.fileUrl) return { valid: false, error: 'PDF file is required' };
      return { valid: true };

    case 'images':
      if (!content.images || content.images.length === 0) {
        return { valid: false, error: 'At least one image is required' };
      }
      return { valid: true };

    case 'video':
      if (!content.videoUrl && !content.embedUrl) {
        return { valid: false, error: 'Video file or embed URL is required' };
      }
      return { valid: true };

    case 'mp3':
      if (!content.audioUrl && !content.embedUrl) {
        return { valid: false, error: 'Audio file or embed URL is required' };
      }
      return { valid: true };

    // === Landing Page Types ===
    case 'menu':
      if (!content.restaurantName) return { valid: false, error: 'Restaurant name is required' };
      if (!content.categories || content.categories.length === 0) {
        return { valid: false, error: 'At least one menu category is required' };
      }
      return { valid: true };

    case 'business':
      if (!content.name) return { valid: false, error: 'Name is required' };
      return { valid: true };

    case 'links':
      if (!content.title) return { valid: false, error: 'Title is required' };
      if (!content.links || content.links.length === 0) {
        return { valid: false, error: 'At least one link is required' };
      }
      return { valid: true };

    case 'coupon':
      if (!content.businessName) return { valid: false, error: 'Business name is required' };
      if (!content.headline) return { valid: false, error: 'Coupon headline is required' };
      return { valid: true };

    case 'social':
      if (!content.name) return { valid: false, error: 'Name is required' };
      if (!content.links || content.links.length === 0) {
        return { valid: false, error: 'At least one social link is required' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown content type' };
  }
}
