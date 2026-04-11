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
import { maskPhone, relativeDate } from '@/lib/helpers';
import { LeadStatus } from '@/types';
import { ChevronDown, Plus, Search, CheckCircle2, Stethoscope, Phone, ChevronRight } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useLeadsStore } from '@/store/useLeadsStore';
import { usePrefetch } from '@/hooks/usePrefetch';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LookupBadge } from '@/components/ui/LookupBadge';

import { APP_CONFIG } from '@/constants';
import { getAllStaticCodes } from '@/lib/lookup-registry';


export default function LeadsList() {
  const navigate = useNavigate();
  const { search, setSearch, statusFilter, setStatusFilter } = useLeadsStore();
  const { data, isLoading: loading, error } = useLeads({ status: statusFilter, search });
  const { prefetchLead } = usePrefetch();

  const leadStatuses = getAllStaticCodes('LeadStatus') as LeadStatus[];
  const leads = data?.items || [];
  const leadsCount = data?.totalCount || 0;

  const [quickStatuses, setQuickStatuses] = useState<LeadStatus[]>(() => {
    try {
      const raw = localStorage.getItem(APP_CONFIG.QUICK_STATUS_STORAGE_KEY);
      if (!raw) return leadStatuses.slice(0, 5);
      const parsed = JSON.parse(raw) as string[];
      return leadStatuses.filter((status) => parsed.includes(status));
    } catch {
      return leadStatuses.slice(0, 5);
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
          <h1 className="text-base font-semibold tracking-tight">All Patients</h1>
          <span className="text-xs text-muted-foreground">{leadsCount}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 h-9 text-sm bg-muted border-0 rounded-lg" 
            />
          </div>
          <LeadFilters />
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
                  className={`shrink-0 rounded-lg text-xs h-7 px-2.5 ${statusFilter === status ? '' : 'text-muted-foreground'}`}
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
                aria-label="Add status tabs"
                className="h-7 w-7 shrink-0 rounded-lg border bg-background text-muted-foreground"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Visible Statuses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {leadStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={`status-${status}`}
                  checked={quickStatuses.includes(status)}
                  onCheckedChange={(checked) => toggleQuickStatus(status, checked === true)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 px-3 py-2">
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading patients...</p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-destructive">{(error as Error).message}</p>
        ) : leads.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No patients found</p>
        ) : (
          leads.map((lead, index) => (
            <div 
              key={lead.id} 
              onClick={() => navigate(`/leads/${lead.id}`)}
              onMouseEnter={() => prefetchLead(lead.id)}
              className="block group bg-card border rounded-xl py-2.5 px-4 hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 truncate">
                      <span className="mr-2 font-medium">{index + 1}.</span>
                      {lead.name}
                    </h3>
                    <LookupBadge category="LeadStatus" code={lead.status} />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {lead.source && <span className="font-medium">{lead.source}, </span>}
                    {lead.reason}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <a 
                    href={`tel:${lead.phone}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="z-10 text-sm text-primary font-bold hover:underline"
                  >
                    {lead.phone}
                  </a>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter mr-2">
                    {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              {(lead.hasEnrollment || lead.hasMedicine) && (
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50">
                  <div className="flex gap-1.5">
                    {lead.hasEnrollment && <div className="p-1 bg-emerald-50 text-emerald-600 rounded" title="Has Enrollment"><CheckCircle2 size={14} /></div>}
                    {lead.hasMedicine && <div className="p-1 bg-blue-50 text-blue-600 rounded" title="Has Medicine"><Stethoscope size={14} /></div>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Link to="/leads/new" className="fixed bottom-24 right-4 z-50">
        <Button className="h-14 w-14 rounded-2xl shadow-lg">
          <Plus className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
