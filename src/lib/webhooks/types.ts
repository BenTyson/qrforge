export interface WebhookConfig {
  id: string;
  qr_code_id: string;
  user_id: string;
  url: string;
  secret: string;
  is_active: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_config_id: string;
  scan_id: string | null;
  event_type: string;
  payload: WebhookPayload | null;
  status: 'pending' | 'success' | 'failed' | 'exhausted';
  http_status: number | null;
  response_body: string | null;
  error_message: string | null;
  attempt_number: number;
  max_attempts: number;
  next_retry_at: string | null;
  created_at: string;
  delivered_at: string | null;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  delivery_id: string;
  qr_code: {
    id: string;
    name: string;
    short_code: string | null;
    content_type: string;
  };
  scan: {
    id: string;
    scanned_at: string;
    device_type: string | null;
    os: string | null;
    browser: string | null;
    country: string | null;
    city: string | null;
    region: string | null;
  };
}

export interface WebhookDeliveryWithConfig extends WebhookDelivery {
  webhook_configs?: {
    user_id: string;
    url: string;
    secret: string;
  };
}
