/**
 * Embed Code Generator Templates
 *
 * Pure utility for generating copy-pasteable HTML/SVG/Markdown
 * embed snippets for QR codes.
 */

export type EmbedType = 'static' | 'dynamic';
export type EmbedFormat = 'html-img' | 'html-inline' | 'markdown';

export interface EmbedCodeOptions {
  embedType: EmbedType;
  format: EmbedFormat;
  size: number;
  showBorder: boolean;
  svgDataURL: string;
  svgContent: string;
  qrName: string;
  qrId: string | null;
  baseUrl: string;
}

/**
 * Escape HTML special characters for safe embedding in attributes.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resize an SVG string by adjusting its width/height attributes.
 */
function resizeSvg(svgContent: string, size: number): string {
  // Replace width/height in the opening <svg> tag only (not child elements)
  return svgContent.replace(/<svg([^>]*)>/, (match, attrs: string) => {
    let newAttrs = attrs;
    if (/width="[^"]*"/.test(newAttrs)) {
      newAttrs = newAttrs.replace(/width="[^"]*"/, `width="${size}"`);
    } else {
      newAttrs = ` width="${size}"` + newAttrs;
    }
    if (/height="[^"]*"/.test(newAttrs)) {
      newAttrs = newAttrs.replace(/height="[^"]*"/, `height="${size}"`);
    } else {
      newAttrs = ` height="${size}"` + newAttrs;
    }
    return `<svg${newAttrs}>`;
  });
}

/**
 * Wrap embed output in a border container div.
 */
function wrapWithBorder(code: string): string {
  return `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:8px;display:inline-block">\n  ${code}\n</div>`;
}

/**
 * Generate embed code based on the provided options.
 */
export function generateEmbedCode(options: EmbedCodeOptions): string {
  const { embedType, format, size, showBorder, svgDataURL, svgContent, qrName, qrId, baseUrl } = options;
  const escapedName = escapeHtml(qrName);

  let code: string;

  if (embedType === 'dynamic') {
    // Dynamic embeds use the public image endpoint
    if (!qrId) {
      return '<!-- QR code must be saved before generating a dynamic embed -->';
    }
    const embedUrl = `${baseUrl}/api/embed/${qrId}?size=${size}`;
    code = `<img src="${embedUrl}" alt="${escapedName}" width="${size}" height="${size}" />`;
  } else {
    // Static embeds
    switch (format) {
      case 'html-img':
        code = `<img src="${svgDataURL}" alt="${escapedName}" width="${size}" height="${size}" />`;
        break;
      case 'html-inline':
        code = resizeSvg(svgContent, size);
        break;
      case 'markdown':
        return `![${escapedName}](${svgDataURL})`;
      default:
        code = `<img src="${svgDataURL}" alt="${escapedName}" width="${size}" height="${size}" />`;
    }
  }

  if (showBorder) {
    code = wrapWithBorder(code);
  }

  return code;
}
