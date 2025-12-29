import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// File size limits by media type
const FILE_LIMITS: Record<string, number> = {
  pdf: 10 * 1024 * 1024,     // 10MB
  image: 5 * 1024 * 1024,    // 5MB
  video: 100 * 1024 * 1024,  // 100MB
  audio: 20 * 1024 * 1024,   // 20MB
};

// Allowed MIME types by media type
const ALLOWED_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mp4'],
};

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

    if (!mediaType || !ALLOWED_TYPES[mediaType]) {
      return NextResponse.json(
        { error: 'Invalid media type. Must be: pdf, image, video, or audio' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimes = ALLOWED_TYPES[mediaType];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${mediaType}. Allowed: ${allowedMimes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = FILE_LIMITS[mediaType];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${mediaType}: ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate secure filename
    const ext = MIME_TO_EXT[file.type] || 'bin';
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const filename = `${Date.now()}-${randomBytes}.${ext}`;
    const path = `${user.id}/${mediaType}/${filename}`;

    // Read file content
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('qr-media')
      .upload(path, arrayBuffer, {
        contentType: file.type,
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
      fileSize: file.size,
      mimeType: file.type,
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
