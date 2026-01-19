import { createClient } from '@/lib/supabase/server';
import { createAdminClient, isAdmin } from '@/lib/admin/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify admin access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const format = searchParams.get('format') || 'csv';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!type || !['users', 'qr-codes', 'scans'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type. Use: users, qr-codes, or scans' }, { status: 400 });
  }

  if (format !== 'csv' && format !== 'json') {
    return NextResponse.json({ error: 'Invalid format. Use: csv or json' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  try {
    let data: Record<string, unknown>[] = [];
    let filename = '';

    switch (type) {
      case 'users': {
        const { data: users, error } = await adminClient
          .from('profiles')
          .select('id, email, full_name, subscription_tier, subscription_status, monthly_scan_count, stripe_customer_id, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        data = users || [];
        filename = `users-export-${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'qr-codes': {
        const { data: qrCodes, error } = await adminClient
          .from('qr_codes')
          .select(`
            id,
            name,
            type,
            content_type,
            short_code,
            destination_url,
            scan_count,
            expires_at,
            created_at,
            updated_at,
            user_id,
            profiles!inner(email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten the data for export
        data = (qrCodes || []).map((qr: Record<string, unknown>) => ({
          id: qr.id,
          name: qr.name,
          type: qr.type,
          content_type: qr.content_type,
          short_code: qr.short_code,
          destination_url: qr.destination_url,
          scan_count: qr.scan_count,
          expires_at: qr.expires_at,
          created_at: qr.created_at,
          updated_at: qr.updated_at,
          user_id: qr.user_id,
          owner_email: (qr.profiles as { email: string })?.email,
        }));
        filename = `qr-codes-export-${new Date().toISOString().split('T')[0]}`;
        break;
      }

      case 'scans': {
        let query = adminClient
          .from('scans')
          .select(`
            id,
            qr_code_id,
            scanned_at,
            country,
            city,
            region,
            device_type,
            os,
            browser,
            referrer,
            qr_codes!inner(name, short_code, user_id)
          `)
          .order('scanned_at', { ascending: false });

        // Apply date filters if provided
        if (from) {
          query = query.gte('scanned_at', from);
        }
        if (to) {
          query = query.lte('scanned_at', to);
        }

        // Limit to 10000 rows for performance
        query = query.limit(10000);

        const { data: scans, error } = await query;

        if (error) throw error;

        // Flatten the data for export
        data = (scans || []).map((scan: Record<string, unknown>) => ({
          id: scan.id,
          qr_code_id: scan.qr_code_id,
          qr_code_name: (scan.qr_codes as { name: string })?.name,
          qr_short_code: (scan.qr_codes as { short_code: string })?.short_code,
          scanned_at: scan.scanned_at,
          country: scan.country,
          city: scan.city,
          region: scan.region,
          device_type: scan.device_type,
          os: scan.os,
          browser: scan.browser,
          referrer: scan.referrer,
        }));
        filename = `scans-export-${new Date().toISOString().split('T')[0]}`;
        break;
      }
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
    }

    // Convert to CSV
    if (data.length === 0) {
      return new NextResponse('No data to export', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      ),
    ];

    return new NextResponse(csvRows.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
