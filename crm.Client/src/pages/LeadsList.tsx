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
import { ChevronDown, Plus, Search, CheckCircle2, Stethoscope, Phone, ChevronRight, MoreVertical, Pencil, Trash2, X, UserPlus } from 'lucide-react';
import { useLeads, useDeleteLead } from '@/hooks/useLeads';
import { useLeadsStore } from '@/store/useLeadsStore';
import { usePrefetch } from '@/hooks/usePrefetch';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LookupBadge } from '@/components/ui/LookupBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lead, LeadStatus } from '@/types';

import { APP_CONFIG } from '@/constants';
import { getAllStaticCodes } from '@/lib/lookup-registry';


export default function LeadsList() {
  const navigate = useNavigate();
  const { search, setSearch, statusFilter, setStatusFilter } = useLeadsStore();
  const { data, isLoading: loading, error } = useLeads({ status: statusFilter, search });
  const { prefetchLead } = usePrefetch();
  const deleteMutation = useDeleteLead();
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  
  // Debounce search
  const [localSearch, setLocalSearch] = useState(search);
  
  useEffect(() => {
    // If localSearch is exactly same as store search, do nothing
    if (localSearch === search) return;

    // Instant clear if empty
    if (localSearch === '') {
      setSearch('');
      return;
    }

    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [localSearch, search, setSearch]);

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearch('');
  };

  // Sync back if search is reset from outside (e.g. Reset Filters)
  useEffect(() => {
    if (search === '') {
      setLocalSearch('');
    }
  }, [search]);

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
              value={localSearch} 
              onChange={e => setLocalSearch(e.target.value)} 
              className="pl-9 pr-8 h-9 text-sm bg-muted border-0 rounded-lg" 
            />
            {localSearch && (
              <button 
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
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
      <div className="space-y-3 px-3 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
             <p className="text-sm text-muted-foreground">Loading patients...</p>
          </div>
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
              className="group relative bg-card border rounded-2xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                {/* 1. Main Info */}
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-[16px] text-slate-900 truncate leading-tight">
                      <span className="text-slate-400 font-medium mr-2">{index + 1}.</span>
                      {lead.name}
                    </h3>
                    <div className="flex gap-1">
                       {lead.hasEnrollment && <CheckCircle2 size={12} className="text-emerald-500 fill-emerald-50/50" />}
                       {lead.hasMedicine && <Stethoscope size={12} className="text-blue-500 fill-blue-50/50" />}
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                      {lead.source && <span className="font-semibold text-slate-700">{lead.source}</span>}
                      {lead.source && lead.reason && <span className="mx-1 opacity-30">•</span>}
                      {lead.reason && <span className="italic">{lead.reason}</span>}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                       <span>Added {relativeDate(lead.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Action Group */}
                <div className="flex flex-col items-end justify-between h-full min-h-[60px]">
                  <div className="flex items-center gap-3">
                    <a 
                      href={`tel:${lead.phone}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                      title="Call Patient"
                    >
                      <Phone className="h-4 w-4 fill-current" />
                    </a>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors text-slate-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl shadow-xl border-slate-200">
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}/edit`);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-700">Edit Patient</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeadToDelete(lead);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="font-medium">Move to Trash</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <LookupBadge category="LeadStatus" code={lead.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link to="/leads/new" className="fixed bottom-24 right-4 z-50">
        <Button className="h-12 w-12 rounded-2xl shadow-lg">
          <UserPlus className="h-5 w-5" strokeWidth={2.5} />
        </Button>
      </Link>

      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move <strong>{leadToDelete?.name}</strong> and all their related data (bills, enrollments, follow-ups) to the trash. You can restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (leadToDelete) {
                  await deleteMutation.mutateAsync(leadToDelete.id);
                  setLeadToDelete(null);
                }
              }}
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
