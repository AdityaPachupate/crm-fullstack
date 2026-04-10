import { LeadStatus } from '@/types';

const dotColors: Record<LeadStatus, string> = {
  New: 'bg-status-new',
  Contacted: 'bg-status-contacted',
  Consulted: 'bg-status-consulted',
  Qualified: 'bg-status-qualified',
  Hot: 'bg-status-hot',
  Warm: 'bg-status-warm',
  Cold: 'bg-status-cold',
  Lost: 'bg-status-lost',
  Converted: 'bg-status-converted',
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <span className={`h-2 w-2 rounded-full ${dotColors[status]}`} />
      {status}
    </span>
  );
}
