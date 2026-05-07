import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/helpers';
import { useRejoins } from '@/hooks/useRejoins';
import { Loader2, Plus } from 'lucide-react';

export default function RejoinsList() {
  const [showTrashed, setShowTrashed] = useState(false);
  const { data, isLoading, restoreRejoin } = useRejoins({ 
    isDeleted: showTrashed,
    pageSize: 100 
  });

  const items = data?.items || [];

  return (
    <div>
      <PageHeader 
        title="Rejoins" 
        right={
          <Link to="/rejoins/new">
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        }
      />
      <div className="px-5 pt-4">
        <div className="flex gap-1.5 mb-4">
          <Button size="sm" variant={!showTrashed ? 'default' : 'ghost'} className={`rounded-full text-xs h-7 px-3 ${!showTrashed ? '' : 'text-muted-foreground'}`} onClick={() => setShowTrashed(false)}>Active</Button>
          <Button size="sm" variant={showTrashed ? 'default' : 'ghost'} className={`rounded-full text-xs h-7 px-3 ${showTrashed ? '' : 'text-muted-foreground'}`} onClick={() => setShowTrashed(true)}>Deleted</Button>
        </div>
      </div>
      
      <div className="divide-y">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No rejoin records found</p>
        ) : (
          items.map(r => (
            <div key={r.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{(r as any).leadName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{r.packageName} · {r.startDate} → {r.endDate}</p>
                </div>
                <span className="text-sm font-medium text-primary shrink-0">
                  {formatCurrency(r.packageCostSnapshot)}
                </span>
              </div>
              {showTrashed && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 rounded-full text-xs h-7" 
                  disabled={restoreRejoin.isPending}
                  onClick={() => restoreRejoin.mutate(r.id)}
                >
                  {restoreRejoin.isPending ? 'Restoring...' : 'Restore'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

