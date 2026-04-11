import { LeadStatus } from '@/types';

export const ALL_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Consulted',
  'Qualified',
  'Lost',
  'Converted',
  'Hot',
  'Cold',
  'Warm'
];

export const LOOKUP_CATEGORIES = {
  LEAD_SOURCE: 'LeadSource',
  LEAD_REASON: 'LeadReason',
} as const;

export const APP_CONFIG = {
  STORAGE_KEY: 'clinic_crm_data',
  QUICK_STATUS_STORAGE_KEY: 'leads_quick_status_buttons_v1',
  DEFAULT_PAGE_SIZE: 100,
};
