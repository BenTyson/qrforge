export type QRContentType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'phone'
  | 'sms';

export interface QRStyleOptions {
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  width: number;
  logoUrl?: string;    // URL to uploaded logo image
  logoSize?: number;   // Logo size as % of QR code (10-30, default 20)
}

export interface URLContent {
  type: 'url';
  url: string;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface WiFiContent {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardContent {
  type: 'vcard';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  url?: string;
}

export interface EmailContent {
  type: 'email';
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneContent {
  type: 'phone';
  phone: string;
}

export interface SMSContent {
  type: 'sms';
  phone: string;
  message?: string;
}

export type QRContent =
  | URLContent
  | TextContent
  | WiFiContent
  | VCardContent
  | EmailContent
  | PhoneContent
  | SMSContent;

export interface QRCodeData {
  id?: string;
  name: string;
  content: QRContent;
  style: QRStyleOptions;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export const QR_TYPE_LABELS: Record<QRContentType, string> = {
  url: 'Website URL',
  text: 'Plain Text',
  wifi: 'WiFi Network',
  vcard: 'Contact Card',
  email: 'Email',
  phone: 'Phone Number',
  sms: 'SMS Message',
};

export const QR_TYPE_ICONS: Record<QRContentType, string> = {
  url: 'link',
  text: 'text',
  wifi: 'wifi',
  vcard: 'user',
  email: 'mail',
  phone: 'phone',
  sms: 'message-square',
};
