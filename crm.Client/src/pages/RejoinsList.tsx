import { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/helpers';

export default function RejoinsList() {
  const { rejoins, leads, restoreRejoin } = useCRM();
  const [showTrashed, setShowTrashed] = useState(false);

  const items = useMemo(() => {
    return rejoins
      .filter(r => showTrashed ? !!r.deletedAt : !r.deletedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rejoins, showTrashed]);

  return (
    <div>
      <PageHeader title="Rejoins" />
      <div className="px-5 pt-4">
        <div className="flex gap-1.5 mb-4">
          <Button size="sm" variant={!showTrashed ? 'default' : 'ghost'} className={`rounded-full text-xs h-7 px-3 ${!showTrashed ? '' : 'text-muted-foreground'}`} onClick={() => setShowTrashed(false)}>Active</Button>
          <Button size="sm" variant={showTrashed ? 'default' : 'ghost'} className={`rounded-full text-xs h-7 px-3 ${showTrashed ? '' : 'text-muted-foreground'}`} onClick={() => setShowTrashed(true)}>Deleted</Button>
        </div>
      </div>
      <div className="divide-y">
        {items.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No rejoin records</p>}
        {items.map(r => {
          const lead = leads.find(l => l.id === r.leadId);
          return (
            <div key={r.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{lead?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{r.packageName} · {r.startDate} → {r.endDate}</p>
                </div>
                <span className="text-sm font-medium text-primary shrink-0">{formatCurrency(r.packageCost)}</span>
              </div>
              {showTrashed && (
                <Button size="sm" variant="outline" className="mt-2 rounded-full text-xs" onClick={() => restoreRejoin(r.id)}>Restore</Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
