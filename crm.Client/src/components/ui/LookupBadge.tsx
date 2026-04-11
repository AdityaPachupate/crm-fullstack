import React from 'react';
import { useLookupRegistry, LookupRegistryCategory } from '@/hooks/useLookupRegistry';
import { cn } from '@/lib/utils';

interface LookupBadgeProps {
  category: LookupRegistryCategory;
  code: string;
  className?: string;
  showIcon?: boolean;
}

export function LookupBadge({ category, code, className, showIcon = true }: LookupBadgeProps) {
  const { getLookupMetadata } = useLookupRegistry();
  const meta = getLookupMetadata(category, code);
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight whitespace-nowrap bg-slate-100 text-slate-500 border border-slate-200/50 transition-all duration-200",
        "hover:bg-slate-200/80",
        className
      )}
    >
      {showIcon && Icon && <Icon size={11} className="shrink-0 opacity-70" />}
      {meta.label}
    </span>
  );
}
