import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/shared/StatusBadge';
import { maskPhone, relativeDate } from '@/lib/helpers';
import { LeadStatus } from '@/types';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useLeadsStore } from '@/store/useLeadsStore';
import { usePrefetch } from '@/hooks/usePrefetch';

import { ALL_STATUSES, APP_CONFIG } from '@/constants';

type LeadsApiItem = {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  source: string;
  reason: string;
  createdAt: string;
  updatedAt: string | null;
  hasEnrollment: boolean;
  hasMedicine: boolean;
};

type LeadsApiResponse = {
  items: LeadsApiItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export default function LeadsList() {
  const navigate = useNavigate();
  const { search, setSearch, statusFilter, setStatusFilter } = useLeadsStore();
  const { data, isLoading: loading, error } = useLeads({ status: statusFilter, search });
  const { prefetchLead } = usePrefetch();
  
  const leads = data?.items || [];
  const leadsCount = data?.totalCount || 0;

  const [quickStatuses, setQuickStatuses] = useState<LeadStatus[]>(() => {
    try {
      const raw = localStorage.getItem(APP_CONFIG.QUICK_STATUS_STORAGE_KEY);
      if (!raw) return ALL_STATUSES.slice(0, 5);
      const parsed = JSON.parse(raw) as string[];
      return ALL_STATUSES.filter((status) => parsed.includes(status));
    } catch {
      return ALL_STATUSES.slice(0, 5);
    }
  });

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.QUICK_STATUS_STORAGE_KEY, JSON.stringify(quickStatuses));
  }, [quickStatuses]);

  const toggleQuickStatus = (status: LeadStatus, checked: boolean) => {
    setQuickStatuses((current) => {
      if (checked) {
        if (current.includes(status)) return current;
        return [...current, status];
      }
      return current.filter((item) => item !== status);
    });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 space-y-3 border-b bg-card/95 backdrop-blur-sm px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">All Leads</h1>
          <span className="text-xs text-muted-foreground">{leadsCount}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, or tag" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-muted border-0 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 min-w-max pr-1">
              <Button
                size="sm"
                variant={statusFilter === 'All' ? 'default' : 'ghost'}
                className={`shrink-0 rounded-full text-xs h-7 px-2.5 ${statusFilter === 'All' ? '' : 'text-muted-foreground'}`}
                onClick={() => setStatusFilter('All')}
              >
                All
              </Button>
              {quickStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'default' : 'ghost'}
                  className={`shrink-0 rounded-full text-xs h-7 px-2.5 ${statusFilter === status ? '' : 'text-muted-foreground'}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Open lead filters"
                className="h-8 w-8 shrink-0 rounded-full border border-border/60 bg-background text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setStatusFilter('All')}>All</DropdownMenuItem>
              <DropdownMenuSeparator />
              {ALL_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={`status-${status}`}
                  checked={quickStatuses.includes(status)}
                  onSelect={() => setStatusFilter(status)}
                  onCheckedChange={(checked) => toggleQuickStatus(status, checked === true)}
                >
                  {status}{statusFilter === status ? ' (selected)' : ''}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 px-3 py-2">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading leads...</p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-destructive">{(error as Error).message}</p>
        ) : leads.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No leads found</p>
        ) : (
          leads.map(lead => (
            <Link 
              key={lead.id} 
              to={`/leads/${lead.id}`} 
              className="block"
              onMouseEnter={() => prefetchLead(lead.id)}
            >
              <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/30">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                  </div>
                  <a href={`tel:${lead.phone}`} className="text-xs text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                    {maskPhone(lead.phone)}
                  </a>
                </div>
                {/* Tags */}
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={lead.status} />
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">{relativeDate(lead.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link to="/leads/new" className="fixed bottom-24 right-4 z-50">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <Plus className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
