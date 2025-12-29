import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { FILE_SIZE_LIMITS } from '@/lib/constants';

// Map MIME types to safe extensions
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
};

// Create DOMPurify instance for SVG sanitization
function createDOMPurify() {
  const window = new JSDOM('').window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return DOMPurify(window as any);
}

// Sanitize SVG content to remove dangerous elements
function sanitizeSVG(svgContent: string): string {
  const purify = createDOMPurify();

  // Configure DOMPurify for SVG
  const clean = purify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // Remove script tags, event handlers, and other dangerous elements
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
    FORBID_ATTR: [
      'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'oninput', 'onsubmit', 'onreset', 'onselect', 'onkeydown',
      'onkeypress', 'onkeyup', 'onmousedown', 'onmouseup', 'onmousemove',
      'onmouseout', 'onwheel', 'ondrag', 'ondrop', 'ondragstart', 'ondragend',
    ],
    // Allow data URIs for embedded images but sanitize them
    ADD_DATA_URI_TAGS: ['image'],
  });

  return clean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user tier (Pro+ required)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';
    if (tier === 'free') {
      return NextResponse.json(
        { error: 'Logo upload requires Pro or Business plan' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and get safe extension
    const safeExtension = ALLOWED_TYPES[file.type];
    if (!safeExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, SVG' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.logo) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 1MB' },
        { status: 400 }
      );
    }

    // Process file content
    let fileBuffer = Buffer.from(await file.arrayBuffer());

    // If SVG, sanitize it
    if (file.type === 'image/svg+xml') {
      const svgContent = fileBuffer.toString('utf-8');
      const sanitizedSVG = sanitizeSVG(svgContent);

      // Verify it's still valid after sanitization
      if (!sanitizedSVG.includes('<svg')) {
        return NextResponse.json(
          { error: 'Invalid SVG file' },
          { status: 400 }
        );
      }

      fileBuffer = Buffer.from(sanitizedSVG, 'utf-8');
    }

    // Generate secure unique filename
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const filename = `${Date.now()}-${randomBytes}.${safeExtension}`;
    const path = `${user.id}/${filename}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('qr-logos')
      .upload(path, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('qr-logos')
      .getPublicUrl(path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: path,
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
