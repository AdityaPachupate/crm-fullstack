import { LeadStatus, FollowUpPriority } from '@/types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function maskPhone(phone: string): string {
  return phone;
}

export function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}Minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}Hours ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}Days ago`;
  if (days < 30) return `${Math.floor(days / 7)}Weeks ago`;
  return date.toLocaleDateString();
}

export function formatCurrency(amount: number | undefined | null): string {
  const val = amount ?? 0;
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function statusColor(status: LeadStatus): string {
  const map: Record<LeadStatus, string> = {
    New: 'bg-status-new/15 text-status-new',
    Contacted: 'bg-status-contacted/15 text-status-contacted',
    Consulted: 'bg-status-consulted/15 text-status-consulted',
    Qualified: 'bg-status-qualified/15 text-status-qualified',
    Hot: 'bg-status-hot/15 text-status-hot',
    Warm: 'bg-status-warm/15 text-status-warm',
    Cold: 'bg-status-cold/15 text-status-cold',
    Lost: 'bg-status-lost/15 text-status-lost',
    Converted: 'bg-status-converted/15 text-status-converted',
  };
  return map[status];
}

export function priorityColor(p: FollowUpPriority): string {
  const map: Record<FollowUpPriority, string> = {
    High: 'bg-priority-high/15 text-priority-high border-priority-high',
    Medium: 'bg-priority-medium/15 text-priority-medium border-priority-medium',
    Low: 'bg-priority-low/15 text-priority-low border-priority-low',
  };
  return map[p];
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

export function isPast(dateStr: string): boolean {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
