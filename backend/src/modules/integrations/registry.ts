import { IntegrationAuthType, IntegrationProvider } from '@prisma/client';

/**
 * The provider catalogue. This is the ONLY place the CRM knows about external
 * providers — each is a self-describing descriptor. Adding/removing a provider
 * is a data change here, not a change to the CRM core, which satisfies the
 * "modular, enable/disable without touching the core" requirement.
 */
export type IntegrationCategory =
  'LEAD_SOURCE' | 'ADS' | 'MESSAGING' | 'FILES' | 'PRODUCTIVITY' | 'MAPS' | 'NOTIFICATIONS';

export interface ProviderDescriptor {
  provider: IntegrationProvider;
  name: string;
  category: IntegrationCategory;
  authType: IntegrationAuthType;
  description: string;
  /** Capabilities this provider offers once connected. */
  capabilities: Array<'sync' | 'webhooks' | 'lead-capture' | 'file-sync' | 'send' | 'attribution'>;
  /** Config fields the UI should collect (non-secret). */
  configFields: { key: string; label: string; required?: boolean }[];
  /** Secret fields (collected once, encrypted, never returned). */
  secretFields: { key: string; label: string }[];
  docsUrl: string;
}

export const PROVIDERS: ProviderDescriptor[] = [
  {
    provider: 'META',
    name: 'Meta Business',
    category: 'ADS',
    authType: 'OAUTH2',
    description: 'Connect Meta Business to manage pages, ad accounts, and lead access.',
    capabilities: ['sync', 'attribution'],
    configFields: [{ key: 'businessId', label: 'Business ID', required: true }],
    secretFields: [{ key: 'accessToken', label: 'System User Access Token' }],
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  },
  {
    provider: 'FACEBOOK_LEAD_ADS',
    name: 'Facebook Lead Ads',
    category: 'LEAD_SOURCE',
    authType: 'WEBHOOK',
    description: 'Auto-create leads from Facebook lead forms in real time.',
    capabilities: ['lead-capture', 'webhooks', 'attribution'],
    configFields: [{ key: 'pageId', label: 'Page ID', required: true }],
    secretFields: [{ key: 'verifyToken', label: 'Webhook Verify Token' }],
    docsUrl: 'https://developers.facebook.com/docs/marketing-api/guides/lead-ads',
  },
  {
    provider: 'INSTAGRAM_LEAD_ADS',
    name: 'Instagram Lead Ads',
    category: 'LEAD_SOURCE',
    authType: 'WEBHOOK',
    description: 'Capture leads from Instagram lead forms automatically.',
    capabilities: ['lead-capture', 'webhooks', 'attribution'],
    configFields: [{ key: 'igAccountId', label: 'IG Account ID', required: true }],
    secretFields: [{ key: 'verifyToken', label: 'Webhook Verify Token' }],
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  {
    provider: 'GOOGLE_ADS',
    name: 'Google Ads',
    category: 'ADS',
    authType: 'OAUTH2',
    description: 'Pull campaign performance and lead-form submissions from Google Ads.',
    capabilities: ['sync', 'lead-capture', 'attribution'],
    configFields: [{ key: 'customerId', label: 'Customer ID', required: true }],
    secretFields: [{ key: 'refreshToken', label: 'OAuth Refresh Token' }],
    docsUrl: 'https://developers.google.com/google-ads/api',
  },
  {
    provider: 'TIKTOK_LEADS',
    name: 'TikTok Lead Generation',
    category: 'LEAD_SOURCE',
    authType: 'OAUTH2',
    description: 'Auto-create leads from TikTok instant forms.',
    capabilities: ['lead-capture', 'webhooks', 'attribution'],
    configFields: [{ key: 'advertiserId', label: 'Advertiser ID', required: true }],
    secretFields: [{ key: 'accessToken', label: 'Access Token' }],
    docsUrl: 'https://business-api.tiktok.com/portal/docs',
  },
  {
    provider: 'TIKTOK_BUSINESS',
    name: 'TikTok Business Center',
    category: 'ADS',
    authType: 'OAUTH2',
    description: 'Connect TikTok Business Center for campaign metrics and attribution.',
    capabilities: ['sync', 'attribution'],
    configFields: [{ key: 'bcId', label: 'Business Center ID', required: true }],
    secretFields: [{ key: 'accessToken', label: 'Access Token' }],
    docsUrl: 'https://business-api.tiktok.com/portal/docs',
  },
  {
    provider: 'WHATSAPP_CLOUD',
    name: 'WhatsApp Business Cloud API',
    category: 'MESSAGING',
    authType: 'API_KEY',
    description: 'Send templates and receive replies via the WhatsApp Cloud API.',
    capabilities: ['send', 'webhooks'],
    configFields: [{ key: 'phoneNumberId', label: 'Phone Number ID', required: true }],
    secretFields: [{ key: 'accessToken', label: 'Permanent Access Token' }],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
  },
  {
    provider: 'SMTP',
    name: 'Email (SMTP)',
    category: 'MESSAGING',
    authType: 'SMTP_CREDS',
    description: 'Send transactional and campaign email through your SMTP server.',
    capabilities: ['send'],
    configFields: [
      { key: 'host', label: 'SMTP Host', required: true },
      { key: 'port', label: 'Port', required: true },
      { key: 'fromEmail', label: 'From Email', required: true },
    ],
    secretFields: [{ key: 'password', label: 'SMTP Password' }],
    docsUrl: 'https://nodemailer.com/smtp/',
  },
  {
    provider: 'TWILIO',
    name: 'Twilio',
    category: 'MESSAGING',
    authType: 'API_KEY',
    description: 'Send SMS and place calls through Twilio.',
    capabilities: ['send'],
    configFields: [{ key: 'accountSid', label: 'Account SID', required: true }],
    secretFields: [{ key: 'authToken', label: 'Auth Token' }],
    docsUrl: 'https://www.twilio.com/docs',
  },
  {
    provider: 'FIREBASE',
    name: 'Firebase Cloud Messaging',
    category: 'NOTIFICATIONS',
    authType: 'API_KEY',
    description: 'Deliver push notifications to the mobile apps via FCM.',
    capabilities: ['send'],
    configFields: [{ key: 'projectId', label: 'Project ID', required: true }],
    secretFields: [{ key: 'serviceAccountJson', label: 'Service Account JSON' }],
    docsUrl: 'https://firebase.google.com/docs/cloud-messaging',
  },
  {
    provider: 'GOOGLE_DRIVE',
    name: 'Google Drive',
    category: 'FILES',
    authType: 'OAUTH2',
    description: 'Central document repository — auto-organize contracts, KYC, brochures.',
    capabilities: ['file-sync', 'sync'],
    configFields: [{ key: 'rootFolderId', label: 'Root Folder ID' }],
    secretFields: [{ key: 'refreshToken', label: 'OAuth Refresh Token' }],
    docsUrl: 'https://developers.google.com/drive/api',
  },
  {
    provider: 'GOOGLE_SHEETS',
    name: 'Google Sheets',
    category: 'PRODUCTIVITY',
    authType: 'OAUTH2',
    description: 'Import leads from Sheets and export reports back automatically.',
    capabilities: ['sync', 'lead-capture'],
    configFields: [{ key: 'spreadsheetId', label: 'Spreadsheet ID' }],
    secretFields: [{ key: 'refreshToken', label: 'OAuth Refresh Token' }],
    docsUrl: 'https://developers.google.com/sheets/api',
  },
  {
    provider: 'GOOGLE_CALENDAR',
    name: 'Google Calendar',
    category: 'PRODUCTIVITY',
    authType: 'OAUTH2',
    description: 'Two-way sync meetings, site visits, and reminders.',
    capabilities: ['sync'],
    configFields: [{ key: 'calendarId', label: 'Calendar ID' }],
    secretFields: [{ key: 'refreshToken', label: 'OAuth Refresh Token' }],
    docsUrl: 'https://developers.google.com/calendar',
  },
  {
    provider: 'GOOGLE_CONTACTS',
    name: 'Google Contacts',
    category: 'PRODUCTIVITY',
    authType: 'OAUTH2',
    description: 'Sync customer contacts to Google Contacts.',
    capabilities: ['sync'],
    configFields: [],
    secretFields: [{ key: 'refreshToken', label: 'OAuth Refresh Token' }],
    docsUrl: 'https://developers.google.com/people',
  },
  {
    provider: 'GOOGLE_MAPS',
    name: 'Google Maps',
    category: 'MAPS',
    authType: 'API_KEY',
    description: 'Geocoding and the interactive project map.',
    capabilities: ['sync'],
    configFields: [],
    secretFields: [{ key: 'apiKey', label: 'Maps API Key' }],
    docsUrl: 'https://developers.google.com/maps',
  },
];

export function findProvider(provider: IntegrationProvider): ProviderDescriptor | undefined {
  return PROVIDERS.find((p) => p.provider === provider);
}
