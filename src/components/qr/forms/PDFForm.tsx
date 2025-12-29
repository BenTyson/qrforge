'use client';

import { MediaUploader, type UploadedFile } from '../MediaUploader';
import type { PDFContent } from '@/lib/qr/types';

interface PDFFormProps {
  content: Partial<PDFContent>;
  onChange: (content: PDFContent) => void;
}

export function PDFForm({ content, onChange }: PDFFormProps) {
  const existingFiles: UploadedFile[] = content.fileUrl
    ? [{
        url: content.fileUrl,
        path: content.fileUrl.split('/').slice(-3).join('/'), // Extract path from URL
        fileName: content.fileName || 'document.pdf',
        fileSize: content.fileSize || 0,
      }]
    : [];

  const handleUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      onChange({
        type: 'pdf',
        fileUrl: file.url,
        fileName: file.fileName,
        fileSize: file.fileSize,
      });
    } else {
      // Clear content if no files
      onChange({
        type: 'pdf',
        fileUrl: '',
        fileName: '',
        fileSize: 0,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-3">Upload PDF Document</p>
        <MediaUploader
          mediaType="pdf"
          multiple={false}
          onUpload={handleUpload}
          existingFiles={existingFiles}
        />
      </div>
      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        When scanned, users will see a page where they can view or download the PDF.
      </p>
    </div>
  );
}
