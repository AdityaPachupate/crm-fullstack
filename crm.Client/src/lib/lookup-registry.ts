import { 
  UserPlus, 
  PhoneCall, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Flame, 
  Snowflake, 
  Sun,
  AlertCircle,
  Clock,
  Ban,
  PhoneOff,
  ChevronRight
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type LookupMetadata = {
  label: string;
  color: string;
  bgColor: string;
  icon?: LucideIcon;
};

export type StaticLookupCategory = 'LeadStatus' | 'FollowUpOutcome' | 'FollowUpPriority';

const REGISTRY: Record<StaticLookupCategory, Record<string, LookupMetadata>> = {
  LeadStatus: {
    New: { label: 'New', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: UserPlus },
    Contacted: { label: 'Contacted', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: PhoneCall },
    Consulted: { label: 'Consulted', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: Stethoscope },
    Qualified: { label: 'Qualified', color: 'text-sky-600', bgColor: 'bg-sky-50', icon: CheckCircle2 },
    Lost: { label: 'Lost', color: 'text-slate-600', bgColor: 'bg-slate-50', icon: XCircle },
    Converted: { label: 'Converted', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: Trophy },
    Hot: { label: 'Hot', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: Flame },
    Cold: { label: 'Cold', color: 'text-blue-400', bgColor: 'bg-blue-50', icon: Snowflake },
    Warm: { label: 'Warm', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Sun },
  },
  FollowUpOutcome: {
    None: { label: 'Pending', color: 'text-slate-400', bgColor: 'bg-slate-50', icon: Clock },
    Busy: { label: 'Busy / NA', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: PhoneOff },
    NotInterested: { label: 'Not Interested', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: Ban },
    CallbackRequested: { label: 'Callback', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: Clock },
    Converted: { label: 'Converted', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: Trophy },
    WrongNumber: { label: 'Wrong Number', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: AlertCircle },
    Disconnected: { label: 'Disconnected', color: 'text-slate-500', bgColor: 'bg-slate-50', icon: PhoneOff },
  },
  FollowUpPriority: {
    Low: { label: 'Low', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    Medium: { label: 'Medium', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    High: { label: 'High', color: 'text-rose-700', bgColor: 'bg-rose-50', icon: AlertCircle },
  }
};

export function getStaticLookup(category: StaticLookupCategory, code: string | undefined): LookupMetadata {
  if (!code) {
    return { label: 'Unknown', color: 'text-slate-400', bgColor: 'bg-slate-50' };
  }
  const meta = REGISTRY[category]?.[code];
  if (meta) return meta;

  // Graceful fallback for unknown codes
  return { 
    label: code, 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-100' 
  };
}

export function getAllStaticCodes(category: StaticLookupCategory): string[] {
  if (!REGISTRY[category]) return [];
  return Object.keys(REGISTRY[category]);
}
