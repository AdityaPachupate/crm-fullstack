import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Button } from '@/components/ui/button';
import { formatCurrency, todayStr } from '@/lib/helpers';
import { Plus } from 'lucide-react';

type Filter = 'All' | 'Active' | 'Expired';

export default function EnrollmentsList() {
  const { enrollments, leads } = useCRM();
  const [filter, setFilter] = useState<Filter>('All');
  const today = todayStr();

  const items = useMemo(() => {
    return enrollments
      .filter(e => !e.deletedAt)
      .filter(e => {
        if (filter === 'Active') return e.startDate <= today && e.endDate >= today;
        if (filter === 'Expired') return e.endDate < today;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [enrollments, filter, today]);

  return (
    <div>
      <div className="sticky top-0 z-40 space-y-3 border-b bg-card/95 backdrop-blur-sm px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight">Enrollments</h1>
        <div className="flex gap-1.5">
          {(['All', 'Active', 'Expired'] as Filter[]).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'ghost'}
              className={`rounded-full text-xs h-7 px-3 ${filter === f ? '' : 'text-muted-foreground'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>
      <div className="divide-y">
        {items.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No enrollments found</p>}
        {items.map(e => {
          const lead = leads.find(l => l.id === e.leadId);
          const active = e.startDate <= today && e.endDate >= today;
          return (
            <Link key={e.id} to={`/enrollments/${e.id}`} className="block">
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{lead?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{e.packageName} · {e.startDate} → {e.endDate}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? 'text-status-converted' : 'text-muted-foreground'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-status-converted' : 'bg-muted-foreground'}`} />
                    {active ? 'Active' : 'Expired'}
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(e.packageCost)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <Link to="/enrollments/new" className="fixed bottom-20 right-4 z-50">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg"><Plus className="h-5 w-5" /></Button>
      </Link>
    </div>
  );
}
