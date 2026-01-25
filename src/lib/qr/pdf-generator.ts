/**
 * Print-Ready PDF Generator for QR Codes
 *
 * Generates professional PDFs with:
 * - Crop marks for print trimming
 * - Bleed area for edge-to-edge printing
 * - Multiple paper sizes (Letter, A4)
 * - Vector QR codes (embedded SVG)
 *
 * Note: Requires jspdf to be installed: npm install jspdf
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsPDFModule = any;

export interface PDFOptions {
  paperSize: 'letter' | 'a4';
  qrSize: number; // Size in inches
  showCropMarks: boolean;
  bleedSize: number; // Bleed in inches (0, 0.125, 0.25)
  title?: string;
  includeInstructions: boolean;
}

export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  paperSize: 'letter',
  qrSize: 3,
  showCropMarks: true,
  bleedSize: 0.125,
  includeInstructions: false,
};

// Paper dimensions in inches
const PAPER_SIZES = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
};

// Convert inches to points (72 points per inch)
const _INCH_TO_PT = 72; // Reserved for future use

/**
 * Generate a print-ready PDF with the QR code
 * Returns a Blob of the PDF file
 */
export async function generatePrintPDF(
  svgContent: string,
  options: PDFOptions = DEFAULT_PDF_OPTIONS
): Promise<Blob> {
  // Dynamically import jspdf to avoid SSR issues
  // jspdf is an optional dependency - install with: npm install jspdf
  let jsPDF: JsPDFModule;
  try {
    // Use variable to prevent TypeScript from trying to resolve the module
    const moduleName = 'jspdf';
    const jspdfModule = await (Function('moduleName', 'return import(moduleName)')(moduleName));
    jsPDF = jspdfModule.jsPDF;
  } catch {
    throw new Error(
      'PDF generation requires jspdf. Install it with: npm install jspdf'
    );
  }

  const paper = PAPER_SIZES[options.paperSize];
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [paper.width, paper.height],
  });

  const centerX = paper.width / 2;
  const centerY = paper.height / 2;
  const qrSize = options.qrSize;
  const bleed = options.bleedSize;
  const totalSize = qrSize + bleed * 2;

  // Calculate QR position (centered)
  const qrX = centerX - totalSize / 2;
  const qrY = centerY - totalSize / 2;

  // Draw bleed area (light gray background)
  if (bleed > 0) {
    pdf.setFillColor(245, 245, 245);
    pdf.rect(qrX, qrY, totalSize, totalSize, 'F');
  }

  // Draw white background for QR area
  pdf.setFillColor(255, 255, 255);
  pdf.rect(qrX + bleed, qrY + bleed, qrSize, qrSize, 'F');

  // Add QR code as SVG image
  // Convert SVG to data URL for embedding
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    // Add the QR code image
    await pdf.addSvgAsImage(
      svgContent,
      qrX + bleed,
      qrY + bleed,
      qrSize,
      qrSize
    );
  } catch {
    // Fallback: convert SVG to PNG and add as image
    const pngDataUrl = await svgToPngDataUrl(svgContent, qrSize * 300);
    pdf.addImage(pngDataUrl, 'PNG', qrX + bleed, qrY + bleed, qrSize, qrSize);
  }

  URL.revokeObjectURL(svgUrl);

  // Draw crop marks
  if (options.showCropMarks) {
    drawCropMarks(pdf, qrX + bleed, qrY + bleed, qrSize, qrSize);
  }

  // Add title if provided
  if (options.title) {
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(options.title, centerX, qrY - 0.5, { align: 'center' });
  }

  // Add printing instructions if requested
  if (options.includeInstructions) {
    addPrintInstructions(pdf, paper, qrY + totalSize + 0.5);
  }

  return pdf.output('blob');
}

/**
 * Draw crop marks at the corners of the trim area
 */
function drawCropMarks(
  pdf: JsPDFModule,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const markLength = 0.25; // Length of crop marks in inches
  const offset = 0.125; // Offset from trim edge

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.01);

  // Top-left corner
  pdf.line(x - offset - markLength, y, x - offset, y); // Horizontal
  pdf.line(x, y - offset - markLength, x, y - offset); // Vertical

  // Top-right corner
  pdf.line(x + width + offset, y, x + width + offset + markLength, y);
  pdf.line(x + width, y - offset - markLength, x + width, y - offset);

  // Bottom-left corner
  pdf.line(x - offset - markLength, y + height, x - offset, y + height);
  pdf.line(x, y + height + offset, x, y + height + offset + markLength);

  // Bottom-right corner
  pdf.line(x + width + offset, y + height, x + width + offset + markLength, y + height);
  pdf.line(x + width, y + height + offset, x + width, y + height + offset + markLength);
}

/**
 * Add printing instructions to the PDF
 */
function addPrintInstructions(
  pdf: JsPDFModule,
  paper: { width: number; height: number },
  startY: number
): void {
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);

  const instructions = [
    'PRINTING INSTRUCTIONS',
    '• Print at 100% scale (do not fit to page)',
    '• Use high-quality paper for best scan results',
    '• Cut along crop marks for exact sizing',
    '• Bleed area extends 0.125" beyond trim edge',
    '',
    `Generated by QRWolf • qrwolf.com`,
  ];

  let y = startY;
  for (const line of instructions) {
    pdf.text(line, paper.width / 2, y, { align: 'center' });
    y += 0.15;
  }
}

/**
 * Convert SVG to PNG data URL for fallback
 */
async function svgToPngDataUrl(svgContent: string, targetWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetWidth;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}

/**
 * Get available paper sizes for UI
 */
export function getPaperSizeOptions(): Array<{ value: string; label: string; dimensions: string }> {
  return [
    { value: 'letter', label: 'US Letter', dimensions: '8.5" × 11"' },
    { value: 'a4', label: 'A4', dimensions: '210mm × 297mm' },
  ];
}

/**
 * Get available bleed options for UI
 */
export function getBleedOptions(): Array<{ value: number; label: string }> {
  return [
    { value: 0, label: 'No bleed' },
    { value: 0.125, label: '0.125" (3mm)' },
    { value: 0.25, label: '0.25" (6mm)' },
  ];
}

/**
 * Get available QR size options for UI
 */
export function getQRSizeOptions(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: '1" × 1"' },
    { value: 1.5, label: '1.5" × 1.5"' },
    { value: 2, label: '2" × 2"' },
    { value: 3, label: '3" × 3"' },
    { value: 4, label: '4" × 4"' },
    { value: 5, label: '5" × 5"' },
  ];
}
