// Server-side QR generation using qr-code-styling with JSDOM
import type { QRContent, QRStyleOptions, ModuleShape, CornerSquareShape, CornerDotShape } from './types';
import { contentToString } from './generator';

/**
 * Server-side QR code generation (no browser APIs)
 * Uses JSDOM for SVG generation
 */

/**
 * Maps our module shape types to the library's dot type strings
 */
function mapModuleShape(shape?: ModuleShape): string {
  if (!shape) return 'square';
  const mapping: Record<ModuleShape, string> = {
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
function mapCornerSquareShape(shape?: CornerSquareShape): string {
  if (!shape) return 'square';
  const mapping: Record<CornerSquareShape, string> = {
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
function mapCornerDotShape(shape?: CornerDotShape): string {
  if (!shape) return 'square';
  const mapping: Record<CornerDotShape, string> = {
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
 */
function getEffectiveErrorCorrection(style: Partial<QRStyleOptions>): 'L' | 'M' | 'Q' | 'H' {
  const baseLevel = style.errorCorrectionLevel || 'M';

  if (style.logoUrl) return 'H';

  if (style.frame?.enabled) {
    const levels = ['L', 'M', 'Q', 'H'] as const;
    const currentIndex = levels.indexOf(baseLevel);
    if (currentIndex < 2) return 'Q';
  }

  return baseLevel;
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
 * Adds a decorative frame around an SVG QR code
 */
function addFrameToSVG(svgString: string, style: Partial<QRStyleOptions>): string {
  if (!style.frame?.enabled) return svgString;

  const frame = style.frame;
  const thickness = frame.thickness || 20;
  const radius = parseInt(frame.radius || '0');
  const frameColor = frame.color || '#0f172a';
  const textColor = frame.textStyle?.fontColor || '#ffffff';
  const fontSize = frame.textStyle?.fontSize || 14;
  const qrWidth = style.width || 512;
  const qrHeight = style.width || 512;

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
    <rect x="${thickness}" y="${topSpace}" width="${qrWidth}" height="${qrHeight}" rx="${Math.max(0, radius - 4)}" fill="${style.backgroundColor || '#ffffff'}"/>

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
 * Builds the QR code configuration options for the library (server-side)
 */
function buildServerQROptions(style: Partial<QRStyleOptions>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: Record<string, any> = {
    type: 'svg',
    data: '',
    width: style.width || 512,
    height: style.width || 512,
    margin: (style.margin ?? 4) * 4,
    qrOptions: {
      errorCorrectionLevel: getEffectiveErrorCorrection(style),
    },
    dotsOptions: {
      type: mapModuleShape(style.moduleShape),
      color: style.foregroundColor || '#000000',
    },
    backgroundOptions: {
      color: style.backgroundColor || '#ffffff',
    },
    cornersSquareOptions: {
      type: mapCornerSquareShape(style.cornerSquareShape),
      color: style.foregroundColor || '#000000',
    },
    cornersDotOptions: {
      type: mapCornerDotShape(style.cornerDotShape),
      color: style.foregroundColor || '#000000',
    },
  };

  // Add gradient if enabled
  if (style.gradient?.enabled) {
    const gradientConfig = {
      type: style.gradient.type === 'radial' ? 'radial' : 'linear',
      rotation: style.gradient.angle ? (style.gradient.angle * Math.PI) / 180 : 0,
      colorStops: [
        { offset: 0, color: style.gradient.startColor },
        { offset: 1, color: style.gradient.endColor },
      ],
    };

    options.dotsOptions.gradient = gradientConfig;
    options.cornersSquareOptions.gradient = gradientConfig;
    options.cornersDotOptions.gradient = gradientConfig;
  }

  // Add logo if present
  if (style.logoUrl) {
    const logoSizePercent = style.logoSize || 20;
    options.image = style.logoUrl;
    options.imageOptions = {
      imageSize: logoSizePercent / 100,
      margin: 4,
    };
  }

  return options;
}

/**
 * Dynamically loads the QRCodeStyling library for server-side use
 */
async function getQRCodeStylingClass() {
  // Dynamic import to avoid bundling issues
  const QRCodeStyling = (await import('qr-code-styling')).default;
  const { JSDOM } = await import('jsdom');

  return { QRCodeStyling, JSDOM };
}

/**
 * Generates a QR code as an SVG string (for server-side use)
 * Supports patterns, eye styles, gradients, and frames
 */
export async function generateQRSVGServer(
  content: QRContent,
  style: Partial<QRStyleOptions> = {}
): Promise<string> {
  const text = contentToString(content);

  if (!text) {
    throw new Error('No content to encode');
  }

  const { QRCodeStyling, JSDOM } = await getQRCodeStylingClass();

  const options = buildServerQROptions(style);
  options.data = text;
  options.jsdom = JSDOM;

  const qrCode = new QRCodeStyling(options);

  // Get SVG string
  const svgBlob = await qrCode.getRawData('svg');
  if (!svgBlob) {
    throw new Error('Failed to generate QR code SVG');
  }

  // Convert blob to string (in Node.js, it's a Buffer)
  let svg: string;
  if (typeof svgBlob === 'string') {
    svg = svgBlob;
  } else if (Buffer.isBuffer(svgBlob)) {
    svg = svgBlob.toString('utf-8');
  } else if (svgBlob instanceof Blob) {
    svg = await svgBlob.text();
  } else {
    // Handle as ArrayBuffer
    svg = Buffer.from(svgBlob as ArrayBuffer).toString('utf-8');
  }

  // Add frame if enabled
  return addFrameToSVG(svg, style);
}

/**
 * Generates a QR code as a data URL (SVG base64)
 * For server-side use without canvas dependencies
 */
export async function generateQRDataURLServer(
  content: QRContent,
  style: Partial<QRStyleOptions> = {}
): Promise<string> {
  const svg = await generateQRSVGServer(content, style);

  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generates a QR code as a PNG buffer (for server-side use)
 * Note: This requires the @resvg/resvg-js peer dependency
 */
export async function generateQRPNG(
  content: QRContent,
  style: Partial<QRStyleOptions> = {}
): Promise<Buffer> {
  // Get SVG string first
  const svg = await generateQRSVGServer(content, style);

  // Try to use resvg for PNG conversion if available
  try {
    // Dynamic import with type assertion to avoid compile-time type errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resvgModule = await import('@resvg/resvg-js' as any);
    const Resvg = resvgModule.Resvg;
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: style.width || 512,
      },
    });
    const pngData = resvg.render();
    return pngData.asPng();
  } catch {
    // If resvg is not available, return SVG as buffer with warning
    console.warn('PNG generation requires @resvg/resvg-js. Returning SVG buffer instead.');
    return Buffer.from(svg);
  }
}
