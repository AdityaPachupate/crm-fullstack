import { FollowUpPriority } from '@/types';

const dotColors: Record<FollowUpPriority, string> = {
  High: 'bg-priority-high',
  Medium: 'bg-priority-medium',
  Low: 'bg-priority-low',
};

export default function PriorityBadge({ priority }: { priority: FollowUpPriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dotColors[priority]}`} />
      {priority}
    </span>
  );
}
