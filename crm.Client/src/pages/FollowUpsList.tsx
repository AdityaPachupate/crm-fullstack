import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Plus as PlusIcon,
  Trash2,
  Search, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  ChevronRight, 
  MessageSquare,
  Filter,
  Loader2,
  CalendarDays,
  ArrowUpDown,
  X
} from 'lucide-react';
import { maskPhone, isToday, isPast, todayStr } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { FollowUpDto, FollowUpPriority } from '@/types';
import { useLeads } from '@/hooks/useLeads';
import { useFollowUps, useFollowUpsList } from '@/hooks/useFollowUps';
import { LookupBadge } from '@/components/ui/LookupBadge';
import PageHeader from '@/components/layout/PageHeader';
import { CompleteFollowUpDialog } from '@/components/leads/CompleteFollowUpDialog';
import { LeadSearchDialog } from '@/components/leads/LeadSearchDialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

type TabType = 'today' | 'upcoming' | 'overdue' | 'completed';
type SortType = 'date-asc' | 'date-desc' | 'priority-high';
type PriorityFilter = 'All' | 'High' | 'Medium' | 'Low';

export default function FollowUpsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('date-asc');
  const [filterPriority, setFilterPriority] = useState<PriorityFilter>('All');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const { data: pendingFollowUps = [], isLoading: loadingPending } = useFollowUpsList({ status: 'Pending' });
  const { data: completedFollowUps = [], isLoading: loadingCompleted } = useFollowUpsList({ status: 'Completed' });
  
  const { completeFollowUp, deleteFollowUp, isCompleting, isDeleting } = useFollowUps();
  
  const [completingFollowUpId, setCompletingFollowUpId] = useState<string | null>(null);
  const [deletingFollowUpId, setDeletingFollowUpId] = useState<string | null>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const filteredFollowUps = useMemo(() => {
    let baseList = activeTab === 'completed' ? completedFollowUps : pendingFollowUps;

    // Filter by Tab
    if (activeTab === 'today') {
      baseList = baseList.filter(f => isToday(f.followUpDate));
    } else if (activeTab === 'upcoming') {
      baseList = baseList.filter(f => !isToday(f.followUpDate) && !isPast(f.followUpDate));
    } else if (activeTab === 'overdue') {
      baseList = baseList.filter(f => isPast(f.followUpDate) && !isToday(f.followUpDate));
    }

    // Filter by Priority
    if (filterPriority !== 'All') {
      baseList = baseList.filter(f => f.priority === filterPriority);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(f => 
        f.leadName.toLowerCase().includes(q) || 
        f.leadPhone.includes(q)
      );
    }

    // Sort
    return baseList.sort((a, b) => {
      if (sortBy === 'priority-high') {
        const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
        const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
        if (pA !== pB) return pB - pA;
      }

      const dateA = activeTab === 'completed' ? new Date(a.completedAt!).getTime() : new Date(a.followUpDate).getTime();
      const dateB = activeTab === 'completed' ? new Date(b.completedAt!).getTime() : new Date(b.followUpDate).getTime();

      if (sortBy === 'date-asc') return dateA - dateB;
      return dateB - dateA; // date-desc or default
    });
  }, [activeTab, pendingFollowUps, completedFollowUps, searchQuery, sortBy, filterPriority]);

  const stats = useMemo(() => ({
    today: pendingFollowUps.filter(f => isToday(f.followUpDate)).length,
    upcoming: pendingFollowUps.filter(f => !isToday(f.followUpDate) && !isPast(f.followUpDate)).length,
    overdue: pendingFollowUps.filter(f => isPast(f.followUpDate) && !isToday(f.followUpDate)).length,
    completed: completedFollowUps.length
  }), [pendingFollowUps, completedFollowUps]);

  const handleComplete = (data: any) => {
    if (!completingFollowUpId) return;
    completeFollowUp.mutate({ id: completingFollowUpId, request: { followUpId: completingFollowUpId, ...data } }, {
      onSuccess: () => setCompletingFollowUpId(null)
    });
  };

  const handleDelete = () => {
    if (!deletingFollowUpId) return;
    deleteFollowUp.mutate(deletingFollowUpId, {
      onSuccess: () => setDeletingFollowUpId(null)
    });
  };

  const selectedFollowUp = useMemo(() => 
    [...pendingFollowUps, ...completedFollowUps].find(f => f.id === completingFollowUpId),
    [pendingFollowUps, completedFollowUps, completingFollowUpId]
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <PageHeader 
        title="Follow-ups" 
        subtitle="Manage your patient interactions"
        icon={CalendarDays}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-10 h-12 bg-white border-none shadow-sm rounded-2xl text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="secondary" 
                className={cn(
                  "h-12 w-12 p-0 rounded-2xl bg-white border-none shadow-sm text-slate-500 hover:text-indigo-600 active:scale-95 transition-all",
                  (filterPriority !== 'All' || sortBy !== 'date-asc') && "text-indigo-600 bg-indigo-50"
                )}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[2.5rem] p-8 border-none h-[70vh]">
              <SheetHeader>
                <SheetTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sort & Filter</SheetTitle>
                <SheetDescription className="text-slate-400 font-medium">Refine your follow-up list</SheetDescription>
              </SheetHeader>

              <div className="mt-8 space-y-8">
                {/* Sorting */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sort By</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'date-asc', label: 'Oldest First', icon: ArrowUpDown },
                      { id: 'date-desc', label: 'Newest First', icon: ArrowUpDown },
                      { id: 'priority-high', label: 'Priority High', icon: AlertCircle },
                    ].map((s) => (
                      <Button
                        key={s.id}
                        variant={sortBy === s.id ? 'default' : 'secondary'}
                        className={cn(
                          "h-14 rounded-2xl font-bold transition-all text-xs justify-start px-4 gap-2",
                          sortBy === s.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                        onClick={() => setSortBy(s.id as SortType)}
                      >
                        <s.icon className="h-4 w-4" />
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filtering */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority Filter</Label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'High', 'Medium', 'Low'].map((p) => (
                      <Button
                        key={p}
                        variant={filterPriority === p ? 'default' : 'secondary'}
                        className={cn(
                          "h-12 px-6 rounded-2xl font-bold transition-all text-xs",
                          filterPriority === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                        onClick={() => setFilterPriority(p as PriorityFilter)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="absolute bottom-8 left-8 right-8 flex-row gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl font-bold text-slate-400"
                  onClick={() => {
                    setSortBy('date-asc');
                    setFilterPriority('All');
                    setIsFilterSheetOpen(false);
                  }}
                >
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button className="flex-[2] h-14 rounded-2xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-100">
                    Show Results
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {(filterPriority !== 'All' || sortBy !== 'date-asc') && (
          <div className="flex flex-wrap gap-2 items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Active:</span>
            {filterPriority !== 'All' && (
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-2 py-1 flex items-center gap-1 font-bold text-[10px]">
                Priority: {filterPriority}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterPriority('All')} />
              </Badge>
            )}
            {sortBy !== 'date-asc' && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none rounded-lg px-2 py-1 flex items-center gap-1 font-bold text-[10px]">
                {sortBy === 'date-desc' ? 'Newest First' : 'Priority High'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSortBy('date-asc')} />
              </Badge>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="w-full bg-slate-200/50 p-1 h-12 rounded-2xl">
            <TabsTrigger value="today" className="flex-1 rounded-xl text-[11px] font-bold uppercase tracking-wider relative">
              Today
              {stats.today > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-[9px]">{stats.today}</span>}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 rounded-xl text-[11px] font-bold uppercase tracking-wider">
              Upcoming
              {stats.upcoming > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-slate-400 text-white rounded-full text-[9px]">{stats.upcoming}</span>}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex-1 rounded-xl text-[11px] font-bold uppercase tracking-wider">
              Overdue
              {stats.overdue > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px]">{stats.overdue}</span>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-xl text-[11px] font-bold uppercase tracking-wider">
              Done
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {(loadingPending || loadingCompleted) ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Finding follow-ups...</p>
              </div>
            ) : filteredFollowUps.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-900">No follow-ups found</p>
                <p className="text-xs text-slate-400 mt-1">Try a different filter or search term</p>
              </div>
            ) : (
              filteredFollowUps.map(f => (
                <div 
                  key={f.id} 
                  className="bg-white border-b border-slate-50 last:border-0 p-4 flex items-center gap-4 active:bg-slate-50 transition-colors group"
                >
                  {/* Status Indicator Dot */}
                  <div className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    f.priority === 'High' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" :
                    f.priority === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/leads/${f.leadId}`} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                            {f.leadName}
                          </h3>
                          {f.isOverdue && activeTab !== 'completed' && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-tighter">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {maskPhone(f.leadPhone)} • {activeTab === 'completed' ? `Done ${new Date(f.completedAt!).toLocaleDateString()}` : `Due ${new Date(f.followUpDate).toLocaleDateString()}`}
                        </p>
                      </Link>
                      
                      <div className="flex items-center gap-1.5">
                        <a href={`tel:${f.leadPhone}`} onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        {f.status === 'Pending' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setCompletingFollowUpId(f.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingFollowUpId(f.id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting && deletingFollowUpId === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    {f.notes && (
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic font-medium">
                        "{f.notes}"
                      </p>
                    )}
                  </div>

                  <Link to={`/leads/${f.leadId}`}>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </div>

      {/* FAB for New Follow-up */}
      <Button 
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all z-50 p-0"
        onClick={() => setIsSearchDialogOpen(true)}
      >
        <PlusIcon className="h-7 w-7 text-white" />
      </Button>

      <CompleteFollowUpDialog
        isOpen={!!completingFollowUpId}
        onClose={() => setCompletingFollowUpId(null)}
        onConfirm={handleComplete}
        isSubmitting={isCompleting}
        initialNotes={selectedFollowUp?.notes}
      />

      <LeadSearchDialog 
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        onSelect={(leadId) => navigate(`/follow-ups/new/${leadId}`)}
      />

      <AlertDialog open={!!deletingFollowUpId} onOpenChange={() => setDeletingFollowUpId(null)}>
        <AlertDialogContent className="w-[90%] max-w-[400px] rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Delete Follow-up?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-400">
              This action cannot be undone. This will permanently delete the follow-up record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-none bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="flex-1 h-12 rounded-2xl bg-rose-500 font-bold text-white hover:bg-rose-600 shadow-lg shadow-rose-100"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
