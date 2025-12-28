import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
    environment: 'ok' | 'error';
  };
  uptime: number;
}

const startTime = Date.now();

/**
 * GET /api/health
 * Health check endpoint for deployment monitoring
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  let databaseStatus: 'ok' | 'error' = 'error';
  let environmentStatus: 'ok' | 'error' = 'error';

  // Check database connection
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (!error) {
      databaseStatus = 'ok';
    }
  } catch {
    databaseStatus = 'error';
  }

  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const hasAllEnvVars = requiredEnvVars.every(
    (envVar) => !!process.env[envVar]
  );
  environmentStatus = hasAllEnvVars ? 'ok' : 'error';

  // Determine overall status
  let status: HealthStatus['status'] = 'healthy';
  if (databaseStatus === 'error' && environmentStatus === 'error') {
    status = 'unhealthy';
  } else if (databaseStatus === 'error' || environmentStatus === 'error') {
    status = 'degraded';
  }

  const healthResponse: HealthStatus = {
    status,
    timestamp,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: databaseStatus,
      environment: environmentStatus,
    },
    uptime,
  };

  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return Response.json(healthResponse, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
