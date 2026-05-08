import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Trash2, 
  Undo2, 
  ArrowLeft, 
  User, 
  Receipt, 
  RefreshCw, 
  Calendar, 
  Pill, 
  Package as PackageIcon,
  Search,
  X
} from 'lucide-react';
import { useLeads, useDeleteLead, useRestoreLead } from '@/hooks/useLeads';
import { useAllEnrollments, useEnrollments } from '@/hooks/useEnrollments';
import { useBills, useDeleteBill, useRestoreBill } from '@/hooks/useBills';
import { useRejoins } from '@/hooks/useRejoins';
import { useMedicines, useMedicineMutations } from '@/hooks/useMedicines';
import { usePackages, usePackageMutations } from '@/hooks/usePackages';
import { useLookups, useLookupMutations } from '@/hooks/useLookups';
import { useFollowUps, useFollowUpsList } from '@/hooks/useFollowUps';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type EntityType = 'leads' | 'enrollments' | 'bills' | 'rejoins' | 'followups' | 'medicines' | 'packages' | 'lookups';

export default function TrashManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EntityType>('leads');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; type: EntityType } | null>(null);

  // Hooks
  const { leads, isLoading: leadsLoading } = useLeads({ isTrash: true });
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useAllEnrollments({ isTrash: true });
  const { data: billsData, isLoading: billsLoading } = useBills(undefined, true);
  const { data: rejoinsData, isLoading: rejoinsLoading } = useRejoins({ isTrash: true });
  const { data: followupsData, isLoading: followupsLoading } = useFollowUpsList({ isTrash: true });
  const { data: medicines, isLoading: medicinesLoading } = useMedicines(true);
  const { data: packages, isLoading: packagesLoading } = usePackages(true);
  const { data: lookups, isLoading: lookupsLoading } = useLookups(true);

  // Mutation Hooks
  const restoreLeadMut = useRestoreLead();
  const deleteLeadMut = useDeleteLead();
  const { restoreEnrollment, deleteEnrollment } = useEnrollments();
  const restoreBillMut = useRestoreBill();
  const deleteBillMut = useDeleteBill();
  const { restoreRejoin, deleteRejoin } = useRejoins();
  const { restoreFollowUp, permanentDeleteFollowUp } = useFollowUps();
  const { restoreMedicine, deleteMedicine } = useMedicineMutations();
  const { restorePackage, deletePackage } = usePackageMutations();
  const { restoreLookup, deleteLookup } = useLookupMutations(true);

  const getFilteredItems = (items: any[], nameKey: string) => {
    return (items || []).filter(item => 
      (item[nameKey] || '').toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleRestore = (type: EntityType, id: string) => {
    switch (type) {
      case 'leads': restoreLeadMut.mutate(id); break;
      case 'enrollments': restoreEnrollment.mutate(id); break;
      case 'bills': restoreBillMut.mutate(id); break;
      case 'rejoins': restoreRejoin.mutate(id); break;
      case 'followups': restoreFollowUp.mutate(id); break;
      case 'medicines': restoreMedicine.mutate(id); break;
      case 'packages': restorePackage.mutate(id); break;
      case 'lookups': restoreLookup(id); break;
    }
  };

  const handlePermanentDelete = () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    switch (type) {
      case 'leads': deleteLeadMut.mutate({ id, isPermanent: true }); break;
      case 'enrollments': deleteEnrollment.mutate({ id, isPermanent: true }); break;
      case 'bills': deleteBillMut.mutate({ billId: id, isPermanent: true }); break;
      case 'rejoins': deleteRejoin.mutate({ id, isPermanent: true }); break;
      case 'followups': permanentDeleteFollowUp.mutate(id); break;
      case 'medicines': deleteMedicine.mutate({ id, isPermanent: true }); break;
      case 'packages': deletePackage.mutate({ id, isPermanent: true }); break;
      case 'lookups': deleteLookup({ id, isPermanent: true }); break;
    }
    setConfirmDelete(null);
  };

  const sections: Record<EntityType, { label: string; icon: any; items: any[]; loading: boolean; nameKey: string; subKey?: string }> = {
    leads: { label: 'Patients', icon: User, items: leads, loading: leadsLoading, nameKey: 'name' },
    enrollments: { label: 'Enrollments', icon: Calendar, items: enrollmentsData?.items || [], loading: enrollmentsLoading, nameKey: 'leadName', subKey: 'packageName' },
    bills: { label: 'Bills', icon: Receipt, items: billsData?.items || [], loading: billsLoading, nameKey: 'leadName' },
    rejoins: { label: 'Rejoins', icon: RefreshCw, items: rejoinsData?.items || [], loading: rejoinsLoading, nameKey: 'leadName', subKey: 'packageName' },
    followups: { label: 'Follow-ups', icon: Calendar, items: followupsData || [], loading: followupsLoading, nameKey: 'leadName', subKey: 'priority' },
    medicines: { label: 'Medicines', icon: Pill, items: medicines || [], loading: medicinesLoading, nameKey: 'name' },
    packages: { label: 'Packages', icon: PackageIcon, items: packages || [], loading: packagesLoading, nameKey: 'name' },
    lookups: { label: 'Lookups', icon: Search, items: (lookups || []).filter(l => l.deletedAt), loading: lookupsLoading, nameKey: 'displayName', subKey: 'category' },
  };

  const activeSection = sections[activeTab];
  const filteredItems = getFilteredItems(activeSection.items, activeSection.nameKey);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header Area */}
      <div className="bg-white px-6 pt-8 pb-4 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trash Management</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Recover or permanently remove data</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={`Search deleted ${activeSection.label.toLowerCase()}...`} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-indigo-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full">
                <X className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {(Object.entries(sections) as [EntityType, any][]).map(([key, section]) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'secondary'}
                size="sm"
                onClick={() => { setActiveTab(key); setSearch(''); }}
                className={cn(
                  "h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0",
                  activeTab === key ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                )}
              >
                <section.icon className="h-3.5 w-3.5" />
                {section.label}
                {section.items.length > 0 && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[9px]",
                    activeTab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {section.items.length}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="p-6">
        {activeSection.loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading trash...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Trash2 className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Trash is empty</p>
              <p className="text-xs text-slate-400 font-medium max-w-[240px] mt-2 leading-relaxed">
                Great! There are no deleted {activeSection.label.toLowerCase()} in your system history.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <activeSection.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">
                          {item[activeSection.nameKey] || 'No Name'}
                        </h3>
                        {activeSection.subKey && item[activeSection.subKey] && (
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">{item[activeSection.subKey]}</p>
                        )}
                        <p className="text-[10px] text-slate-400 font-medium mt-1">
                          Deleted {formatDate(item.deletedAt || item.updatedAt || item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                      onClick={() => handleRestore(activeTab, item.id)}
                    >
                      <Undo2 className="h-3.5 w-3.5 mr-2" /> Restore
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                      onClick={() => setConfirmDelete({ id: item.id, name: item[activeSection.nameKey], type: activeTab })}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Wipe Forever
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-3xl border-none p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Wipe Forever?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-black text-slate-900">"{confirmDelete?.name}"</span>? 
              This action <span className="text-rose-500 font-bold underline">cannot be undone</span> and all related data will be erased forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3">
            <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold text-slate-600" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button variant="destructive" className="flex-1 h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100" onClick={handlePermanentDelete}>
              Yes, Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
