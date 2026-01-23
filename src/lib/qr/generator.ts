'use client';

import QRCodeStyling from 'qr-code-styling';
import type { QRContent, QRStyleOptions, ModuleShape, CornerSquareShape, CornerDotShape } from './types';
import type { Options as QRCodeStylingOptions, DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { normalizeUrl } from '@/lib/utils';

/**
 * Normalizes all URL fields in QR content before saving.
 * Ensures URLs have proper https:// protocol.
 *
 * @param content - The QR content object
 * @returns A new content object with normalized URLs
 */
export function normalizeContentUrls(content: QRContent): QRContent {
  if (!content) return content;

  switch (content.type) {
    case 'url':
      return {
        ...content,
        url: content.url ? normalizeUrl(content.url) : content.url,
      };

    case 'facebook':
      return {
        ...content,
        profileUrl: content.profileUrl ? normalizeUrl(content.profileUrl) : content.profileUrl,
      };

    case 'apps':
      return {
        ...content,
        appStoreUrl: content.appStoreUrl ? normalizeUrl(content.appStoreUrl) : content.appStoreUrl,
        playStoreUrl: content.playStoreUrl ? normalizeUrl(content.playStoreUrl) : content.playStoreUrl,
        fallbackUrl: content.fallbackUrl ? normalizeUrl(content.fallbackUrl) : content.fallbackUrl,
      };

    case 'pdf':
      return {
        ...content,
        fileUrl: content.fileUrl ? normalizeUrl(content.fileUrl) : content.fileUrl,
      };

    case 'video':
      return {
        ...content,
        videoUrl: content.videoUrl ? normalizeUrl(content.videoUrl) : content.videoUrl,
        embedUrl: content.embedUrl ? normalizeUrl(content.embedUrl) : content.embedUrl,
      };

    case 'mp3':
      return {
        ...content,
        audioUrl: content.audioUrl ? normalizeUrl(content.audioUrl) : content.audioUrl,
        embedUrl: content.embedUrl ? normalizeUrl(content.embedUrl) : content.embedUrl,
      };

    case 'business':
      return {
        ...content,
        website: content.website ? normalizeUrl(content.website) : content.website,
      };

    case 'links':
      return {
        ...content,
        links: content.links?.map(link => ({
          ...link,
          url: link.url ? normalizeUrl(link.url) : link.url,
        })) || [],
      };

    case 'social':
      return {
        ...content,
        links: content.links?.map(link => {
          // Only normalize if it looks like a URL (has a dot but no protocol)
          if (link.url && link.url.includes('.') && !link.url.includes(':')) {
            return { ...link, url: normalizeUrl(link.url) };
          }
          return link;
        }) || [],
      };

    // Other types (text, wifi, vcard, email, phone, sms, whatsapp, instagram, images, menu, coupon)
    // don't have URL fields that need normalization or are handled differently
    default:
      return content;
  }
}

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

    case 'linkedin':
      // Build LinkedIn profile URL
      const linkedinUsername = content.username.replace(/^@/, '');
      return `https://linkedin.com/in/${linkedinUsername}`;

    case 'apps':
      // Return fallback URL or first available store URL
      // For smart redirects, this will point to a landing page
      return content.fallbackUrl || content.appStoreUrl || content.playStoreUrl || '';

    // === Reviews ===
    case 'google-review':
      return `https://qrwolf.com/preview/${content.type}`;

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
 * Maps our module shape types to the library's dot type strings
 */
function mapModuleShape(shape?: ModuleShape): DotType {
  if (!shape) return 'square';
  // The library uses kebab-case for some types
  const mapping: Record<ModuleShape, DotType> = {
    square: 'square',
    dots: 'dots',
    rounded: 'rounded',
    extraRounded: 'extra-rounded',
    classy: 'classy',
    classyRounded: 'classy-rounded',
  };
  return mapping[shape] || 'square';
}

/**
 * Maps our corner square shape types to the library's corner square type
 */
function mapCornerSquareShape(shape?: CornerSquareShape): CornerSquareType {
  if (!shape) return 'square';
  const mapping: Record<CornerSquareShape, CornerSquareType> = {
    square: 'square',
    dot: 'dot',
    extraRounded: 'extra-rounded',
    dots: 'dots',
    rounded: 'rounded',
    classy: 'classy',
    classyRounded: 'classy-rounded',
  };
  return mapping[shape] || 'square';
}

/**
 * Maps our corner dot shape types to the library's corner dot type
 */
function mapCornerDotShape(shape?: CornerDotShape): CornerDotType {
  if (!shape) return 'square';
  const mapping: Record<CornerDotShape, CornerDotType> = {
    square: 'square',
    dot: 'dot',
    dots: 'dots',
    rounded: 'rounded',
    extraRounded: 'extra-rounded',
    classy: 'classy',
    classyRounded: 'classy-rounded',
  };
  return mapping[shape] || 'square';
}

/**
 * Determines the effective error correction level based on style options.
 * Logo presence requires higher error correction.
 */
function getEffectiveErrorCorrection(style: QRStyleOptions): 'L' | 'M' | 'Q' | 'H' {
  // Auto-bump to H when logo is present
  if (style.logoUrl) {
    return 'H';
  }

  // Auto-bump to Q for frames
  if (style.frame?.enabled) {
    const levels = ['L', 'M', 'Q', 'H'] as const;
    const currentIndex = levels.indexOf(style.errorCorrectionLevel);
    if (currentIndex < 2) return 'Q';
  }

  return style.errorCorrectionLevel;
}

/**
 * Builds the QR code configuration options for the library
 */
function buildQROptions(style: QRStyleOptions): QRCodeStylingOptions {
  const options: QRCodeStylingOptions = {
    type: 'svg',
    width: style.width,
    height: style.width,
    margin: style.margin * 4, // Library uses pixels, our margin is in modules
    data: '', // Will be set by caller
    qrOptions: {
      errorCorrectionLevel: getEffectiveErrorCorrection(style),
    },
    dotsOptions: {
      type: mapModuleShape(style.moduleShape),
      color: style.foregroundColor,
    },
    backgroundOptions: {
      color: style.backgroundColor,
    },
    cornersSquareOptions: {
      type: mapCornerSquareShape(style.cornerSquareShape),
      color: style.foregroundColor,
    },
    cornersDotOptions: {
      type: mapCornerDotShape(style.cornerDotShape),
      color: style.foregroundColor,
    },
  };

  // Add gradient if enabled
  if (style.gradient?.enabled) {
    const gradientConfig = {
      type: style.gradient.type as 'linear' | 'radial',
      rotation: style.gradient.angle ? (style.gradient.angle * Math.PI) / 180 : 0,
      colorStops: [
        { offset: 0, color: style.gradient.startColor },
        { offset: 1, color: style.gradient.endColor },
      ],
    };

    options.dotsOptions = {
      ...options.dotsOptions,
      gradient: gradientConfig,
    };
    options.cornersSquareOptions = {
      ...options.cornersSquareOptions,
      gradient: gradientConfig,
    };
    options.cornersDotOptions = {
      ...options.cornersDotOptions,
      gradient: gradientConfig,
    };
  }

  // Add logo if present
  if (style.logoUrl) {
    const logoSizePercent = style.logoSize || 20;
    options.image = style.logoUrl;
    options.imageOptions = {
      imageSize: logoSizePercent / 100,
      margin: 4,
      crossOrigin: 'anonymous',
    };
  }

  return options;
}

/**
 * Adds a decorative frame around an SVG QR code
 */
function addFrameToSVG(svgString: string, style: QRStyleOptions): string {
  if (!style.frame?.enabled) return svgString;

  const frame = style.frame;
  const thickness = frame.thickness || 20;
  const radius = parseInt(frame.radius || '0');
  const frameColor = frame.color || '#0f172a';
  const textColor = frame.textStyle?.fontColor || '#ffffff';
  const fontSize = frame.textStyle?.fontSize || 14;

  // Parse the SVG to get dimensions
  const widthMatch = svgString.match(/width="(\d+)"/);
  const heightMatch = svgString.match(/height="(\d+)"/);
  const qrWidth = widthMatch ? parseInt(widthMatch[1]) : style.width;
  const qrHeight = heightMatch ? parseInt(heightMatch[1]) : style.width;

  // Calculate new dimensions - add extra padding for text areas
  const textPadding = 16;
  const topSpace = frame.text?.top ? thickness + fontSize + textPadding : thickness;
  const bottomSpace = frame.text?.bottom ? thickness + fontSize + textPadding : thickness;
  const newWidth = qrWidth + thickness * 2;
  const newHeight = qrHeight + topSpace + bottomSpace;

  // Create wrapper SVG with frame
  let framedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${newWidth}" height="${newHeight}" viewBox="0 0 ${newWidth} ${newHeight}">
    <!-- Frame background -->
    <rect x="0" y="0" width="${newWidth}" height="${newHeight}" rx="${radius}" fill="${frameColor}"/>

    <!-- QR code background -->
    <rect x="${thickness}" y="${topSpace}" width="${qrWidth}" height="${qrHeight}" rx="${Math.max(0, radius - 4)}" fill="${style.backgroundColor}"/>

    <!-- QR code -->
    <g transform="translate(${thickness}, ${topSpace})">
      ${svgString.replace(/<\?xml[^?]*\?>/g, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
    </g>`;

  // Add top text - centered vertically in the top space area
  if (frame.text?.top) {
    framedSVG += `
    <text x="${newWidth / 2}" y="${topSpace / 2 + fontSize / 3}"
          fill="${textColor}"
          font-family="Inter, system-ui, sans-serif"
          font-size="${fontSize}"
          font-weight="600"
          text-anchor="middle">${escapeXml(frame.text.top)}</text>`;
  }

  // Add bottom text - centered vertically in the bottom space area
  if (frame.text?.bottom) {
    framedSVG += `
    <text x="${newWidth / 2}" y="${topSpace + qrHeight + bottomSpace / 2 + fontSize / 3}"
          fill="${textColor}"
          font-family="Inter, system-ui, sans-serif"
          font-size="${fontSize}"
          font-weight="600"
          text-anchor="middle">${escapeXml(frame.text.bottom)}</text>`;
  }

  framedSVG += '\n</svg>';
  return framedSVG;
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a QR code as a Data URL (base64 encoded image)
 * Supports patterns, eye styles, gradients, logos, and frames
 */
export async function generateQRDataURL(
  content: QRContent,
  style: QRStyleOptions = {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 256,
  }
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const options = buildQROptions(style);
  options.data = text;

  const qrCode = new QRCodeStyling(options);

  // Get SVG blob
  const blob = await qrCode.getRawData('svg');
  if (!blob) {
    throw new Error('Failed to generate QR code');
  }

  // Convert blob to string (handle both Blob and Buffer)
  let svgString: string;
  if (blob instanceof Blob) {
    svgString = await blob.text();
  } else if (Buffer.isBuffer(blob)) {
    svgString = blob.toString('utf-8');
  } else {
    svgString = new TextDecoder().decode(blob as ArrayBuffer);
  }

  // Add frame if enabled
  const finalSvg = addFrameToSVG(svgString, style);

  // Convert to data URL
  const base64 = btoa(unescape(encodeURIComponent(finalSvg)));
  return `data:image/svg+xml;base64,${base64}`;
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
    margin: 4,
    width: 256,
  }
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const options = buildQROptions(style);
  options.data = text;

  const qrCode = new QRCodeStyling(options);

  // Get SVG blob
  const blob = await qrCode.getRawData('svg');
  if (!blob) {
    throw new Error('Failed to generate QR code SVG');
  }

  // Convert blob to string (handle both Blob and Buffer)
  let svgString: string;
  if (blob instanceof Blob) {
    svgString = await blob.text();
  } else if (Buffer.isBuffer(blob)) {
    svgString = blob.toString('utf-8');
  } else {
    svgString = new TextDecoder().decode(blob as ArrayBuffer);
  }

  // Add frame if enabled
  return addFrameToSVG(svgString, style);
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
    margin: 4,
    width: 256,
  }
): Promise<void> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  // For framed QR codes, we need to generate SVG and render to canvas
  if (style.frame?.enabled) {
    const svgString = await generateQRSVG(content, style);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    });
    return;
  }

  // For non-framed QR codes, use the library's canvas rendering
  const options = buildQROptions(style);
  options.data = text;
  options.type = 'canvas';

  const qrCode = new QRCodeStyling(options);
  await qrCode.append(canvas.parentElement || document.body);

  // The library creates its own canvas, we need to copy to our canvas
  const generatedCanvas = canvas.parentElement?.querySelector('canvas:not(:scope)') || null;
  if (generatedCanvas && generatedCanvas !== canvas) {
    canvas.width = style.width;
    canvas.height = style.width;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(generatedCanvas as HTMLCanvasElement, 0, 0);
    }
    generatedCanvas.remove();
  }
}

/**
 * Downloads a QR code as PNG by converting SVG to canvas first
 */
export async function downloadQRPNG(dataURL: string, filename: string = 'qrcode'): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Create canvas with the image dimensions
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw the SVG image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Convert canvas to PNG blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load QR code image'));
    };

    img.src = dataURL;
  });
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

    case 'linkedin':
      if (!content.username) return { valid: false, error: 'LinkedIn username is required' };
      return { valid: true };

    case 'apps':
      if (!content.appStoreUrl && !content.playStoreUrl && !content.fallbackUrl) {
        return { valid: false, error: 'At least one app store URL or fallback URL is required' };
      }
      return { valid: true };

    // === Reviews ===
    case 'google-review':
      if (!content.placeId) return { valid: false, error: 'Place ID is required' };
      if (content.placeId.length < 20) return { valid: false, error: 'Place ID must be at least 20 characters' };
      if (!content.businessName) return { valid: false, error: 'Business name is required' };
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
