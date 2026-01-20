import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import sharp from 'sharp';
import { FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/constants';

// Map MIME types to extensions
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
};

// Image optimization settings
const IMAGE_MAX_DIMENSION = 2000; // Max width or height in pixels
const IMAGE_QUALITY = 80; // Compression quality (0-100)

/**
 * Optimize image: resize if too large, compress, convert to WebP
 * Returns optimized buffer and new content type
 */
async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  // GIFs may be animated - preserve them but resize if needed
  if (mimeType === 'image/gif') {
    const metadata = await sharp(buffer, { animated: true }).metadata();

    // Only resize if over max dimension
    if (metadata.width && metadata.height &&
        (metadata.width > IMAGE_MAX_DIMENSION || metadata.height > IMAGE_MAX_DIMENSION)) {
      const optimized = await sharp(buffer, { animated: true })
        .resize(IMAGE_MAX_DIMENSION, IMAGE_MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .gif()
        .toBuffer();
      return { buffer: optimized, contentType: 'image/gif', extension: 'gif' };
    }
    return { buffer, contentType: mimeType, extension: 'gif' };
  }

  // For JPEG, PNG, WebP - convert to WebP for best compression
  // .rotate() without args auto-orients based on EXIF and strips all EXIF metadata (privacy protection)
  const optimized = await sharp(buffer)
    .rotate() // Auto-orient and strip EXIF metadata (removes GPS, camera info, etc.)
    .resize(IMAGE_MAX_DIMENSION, IMAGE_MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer();

  return { buffer: optimized, contentType: 'image/webp', extension: 'webp' };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user tier (Pro+ required for media uploads)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';
    if (tier === 'free') {
      return NextResponse.json(
        { error: 'Media uploads require Pro or Business plan' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const validMediaTypes: readonly string[] = ['pdf', 'image', 'video', 'audio'];
    if (!mediaType || !validMediaTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: 'Invalid media type. Must be: pdf, image, video, or audio' },
        { status: 400 }
      );
    }

    // Validate file type
    const mediaTypeKey = mediaType as keyof typeof ALLOWED_MIME_TYPES;
    const allowedMimes = ALLOWED_MIME_TYPES[mediaTypeKey] as readonly string[];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${mediaType}. Allowed: ${allowedMimes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = FILE_SIZE_LIMITS[mediaTypeKey];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${mediaType}: ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    let fileBuffer: Buffer = Buffer.from(arrayBuffer);
    let contentType = file.type;
    let ext = MIME_TO_EXT[file.type] || 'bin';

    // Optimize images (JPEG, PNG, GIF, WebP)
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (mediaType === 'image' && imageTypes.includes(file.type)) {
      try {
        const optimized = await optimizeImage(fileBuffer, file.type);
        fileBuffer = optimized.buffer;
        contentType = optimized.contentType;
        ext = optimized.extension;
        console.log(`Image optimized: ${file.size} → ${fileBuffer.length} bytes (${Math.round((1 - fileBuffer.length / file.size) * 100)}% reduction)`);
      } catch (err) {
        console.error('Image optimization failed, using original:', err);
        // Fall back to original file if optimization fails
      }
    }

    // Generate secure filename
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const filename = `${Date.now()}-${randomBytes}.${ext}`;
    const path = `${user.id}/${mediaType}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('qr-media')
      .upload(path, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed. Please try again.' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('qr-media')
      .getPublicUrl(path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path,
      fileName: file.name,
      fileSize: fileBuffer.length, // Return optimized size
      originalSize: file.size,
      mimeType: contentType, // Return actual content type (may be webp)
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Security: Ensure path belongs to user
    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('qr-media')
      .remove([path]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Delete failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
