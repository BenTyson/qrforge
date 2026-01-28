import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess, rateLimitError, monthlyLimitError, incrementRequestCount, validators } from '@/lib/api/auth';
import { PLANS } from '@/lib/stripe/plans';
import type { SubscriptionTier } from '@/lib/stripe/plans';
import { headers } from 'next/headers';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Constants for validation
const MAX_NAME_LENGTH = 255;
const MAX_URL_LENGTH = 2048;
const MAX_CONTENT_SIZE = 10000; // 10KB max for content object

/**
 * GET /api/v1/qr-codes
 * List all QR codes for the authenticated user
 */
export async function GET(request: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo, monthlyLimitExceeded } = await validateApiKey(authHeader, clientIp);

  // Check rate limit
  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  // Check monthly limit
  if (monthlyLimitExceeded) {
    return monthlyLimitError();
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(request.url);

  // Validate and sanitize pagination params
  let limit = parseInt(url.searchParams.get('limit') || '50', 10);
  let offset = parseInt(url.searchParams.get('offset') || '0', 10);

  // Ensure positive integers
  limit = Math.max(1, Math.min(isNaN(limit) ? 50 : limit, 100));
  offset = Math.max(0, isNaN(offset) ? 0 : offset);

  const type = url.searchParams.get('type');

  let query = supabase
    .from('qr_codes')
    .select('id, name, type, content_type, content, short_code, destination_url, scan_count, created_at, expires_at, active_from, active_until', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Validate type filter
  if (type && validators.isValidQRType(type)) {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError('Failed to fetch QR codes', 500);
  }

  // Add image URLs to each QR code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const qrCodesWithUrls = data?.map(qr => ({
    ...qr,
    redirect_url: qr.short_code ? `${baseUrl}/r/${qr.short_code}` : null,
    image_url: `${baseUrl}/api/v1/qr-codes/${qr.id}/image`,
    image_url_svg: `${baseUrl}/api/v1/qr-codes/${qr.id}/image?format=svg`,
  })) || [];

  // Increment request count after successful operation
  await incrementRequestCount(user.keyHash);

  return apiSuccess({
    qr_codes: qrCodesWithUrls,
    total: count,
    limit,
    offset,
  });
}

/**
 * POST /api/v1/qr-codes
 * Create a new QR code
 */
export async function POST(request: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo, monthlyLimitExceeded } = await validateApiKey(authHeader, clientIp);

  // Check rate limit
  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  // Check monthly limit
  if (monthlyLimitExceeded) {
    return monthlyLimitError();
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Check body size (rough estimate)
  if (JSON.stringify(body).length > MAX_CONTENT_SIZE) {
    return apiError('Request body too large', 400);
  }

  const { name, type = 'dynamic', content_type = 'url', content, style, expires_at, active_from, active_until } = body;

  // Validate name
  if (!name || typeof name !== 'string') {
    return apiError('name is required', 400);
  }
  if (!validators.validateStringLength(name, MAX_NAME_LENGTH)) {
    return apiError(`name must be ${MAX_NAME_LENGTH} characters or less`, 400);
  }

  // Validate type
  if (!validators.isValidQRType(type)) {
    return apiError('type must be "static" or "dynamic"', 400);
  }

  // Validate content_type
  if (!validators.isValidContentType(content_type)) {
    return apiError('Invalid content_type. Allowed: url, text, wifi, vcard, email, phone, sms, whatsapp, facebook, instagram, apps, pdf, images, video, mp3, menu, business, links, coupon, social', 400);
  }

  // Validate content
  if (!content || typeof content !== 'object') {
    return apiError('content is required', 400);
  }

  // Validate content based on content_type
  const contentValidation = validators.validateContent(content as Record<string, unknown>, content_type);
  if (!contentValidation.valid) {
    return apiError(contentValidation.error || 'Invalid content', 400);
  }

  // Additional URL length validation for URL-based types
  if (content_type === 'url' && content.url) {
    if (!validators.validateStringLength(content.url as string, MAX_URL_LENGTH)) {
      return apiError(`URL must be ${MAX_URL_LENGTH} characters or less`, 400);
    }
  }

  // Validate dates if provided
  if (expires_at && !validators.isValidISODate(expires_at)) {
    return apiError('expires_at must be a valid ISO date string', 400);
  }
  if (active_from && !validators.isValidISODate(active_from)) {
    return apiError('active_from must be a valid ISO date string', 400);
  }
  if (active_until && !validators.isValidISODate(active_until)) {
    return apiError('active_until must be a valid ISO date string', 400);
  }
  if (active_from && active_until && new Date(active_from) >= new Date(active_until)) {
    return apiError('active_from must be before active_until', 400);
  }

  // Build style object with defaults and validation
  const defaultStyle = {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M' as const,
    margin: 2,
  };

  const validatedStyle = {
    foregroundColor: style?.foregroundColor && validators.isValidHexColor(style.foregroundColor)
      ? style.foregroundColor
      : defaultStyle.foregroundColor,
    backgroundColor: style?.backgroundColor && validators.isValidHexColor(style.backgroundColor)
      ? style.backgroundColor
      : defaultStyle.backgroundColor,
    errorCorrectionLevel: style?.errorCorrectionLevel && validators.isValidErrorCorrectionLevel(style.errorCorrectionLevel)
      ? style.errorCorrectionLevel
      : defaultStyle.errorCorrectionLevel,
    margin: typeof style?.margin === 'number' && style.margin >= 0 && style.margin <= 10
      ? style.margin
      : defaultStyle.margin,
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Enforce QR code creation limit
  const tier = user.tier as SubscriptionTier;
  const qrLimit = PLANS[tier].dynamicQRLimit;
  if (qrLimit !== -1) {
    const { count, error: countError } = await supabase
      .from('qr_codes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      return apiError('Failed to check QR code limit', 500);
    }

    if (count !== null && count >= qrLimit) {
      return apiError(`QR code limit reached (${qrLimit}). Upgrade your plan for more.`, 403);
    }
  }

  // Generate short code for dynamic QR codes
  let shortCode = null;
  let destinationUrl = null;

  if (type === 'dynamic') {
    shortCode = generateShortCode();
    destinationUrl = content.url || null;
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: user.id,
      name: name.trim(),
      type,
      content_type,
      content,
      short_code: shortCode,
      destination_url: destinationUrl,
      expires_at: expires_at || null,
      active_from: active_from || null,
      active_until: active_until || null,
      style: validatedStyle,
    })
    .select('id, name, type, content_type, content, short_code, destination_url, scan_count, created_at, style')
    .single();

  if (error) {
    console.error('API create error:', error);
    return apiError('Failed to create QR code', 500);
  }

  // Build response with image URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  const response = {
    ...data,
    redirect_url: shortCode ? `${baseUrl}/r/${shortCode}` : null,
    image_url: `${baseUrl}/api/v1/qr-codes/${data.id}/image`,
    image_url_svg: `${baseUrl}/api/v1/qr-codes/${data.id}/image?format=svg`,
  };

  // Increment request count after successful operation
  await incrementRequestCount(user.keyHash);

  return apiSuccess(response, 201);
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(7);
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
}
