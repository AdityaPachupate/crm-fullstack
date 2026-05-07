import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { useRejoins } from '@/hooks/useRejoins';
import { Loader2 } from 'lucide-react';

type Entity = 'leads' | 'followUps' | 'enrollments' | 'bills' | 'rejoins';

export default function TrashManagement() {
  const crm = useCRM();
  const [confirmId, setConfirmId] = useState<{ entity: Entity; id: string; name: string } | null>(null);

  // Rejoins Hook
  const { data: trashedRejoinsData, isLoading: rejoinsLoading, restoreRejoin, deleteRejoin } = useRejoins({ isDeleted: true });
  const trashedRejoins = trashedRejoinsData?.items || [];

  const entities: { 
    key: Entity; 
    label: string; 
    items: any[]; 
    restore: (id: string) => void; 
    hardDelete: (id: string) => void; 
    getName: (item: any) => string;
    loading?: boolean;
  }[] = [
    { key: 'leads', label: 'Patients', items: crm.leads.filter(l => l.deletedAt), restore: crm.restoreLead, hardDelete: crm.hardDeleteLead, getName: (l) => l.name },
    { key: 'followUps', label: 'Follow-ups', items: crm.followUps.filter(f => f.deletedAt), restore: crm.restoreFollowUp, hardDelete: crm.hardDeleteFollowUp, getName: (f) => { const lead = crm.leads.find(l => l.id === f.leadId); return `${lead?.name || 'Unknown'} - ${f.followUpDate}`; } },
    { key: 'enrollments', label: 'Enrollments', items: crm.enrollments.filter(e => e.deletedAt), restore: crm.restoreEnrollment, hardDelete: crm.hardDeleteEnrollment, getName: (e) => e.packageName },
    { key: 'bills', label: 'Bills', items: crm.bills.filter(b => b.deletedAt), restore: crm.restoreBill, hardDelete: crm.hardDeleteBill, getName: (b) => `Bill ${new Date(b.createdAt).toLocaleDateString()}` },
    { 
      key: 'rejoins', 
      label: 'Rejoins', 
      items: trashedRejoins, 
      restore: (id) => restoreRejoin.mutate(id), 
      hardDelete: (id) => deleteRejoin.mutate({ id, isPermanent: true }), 
      getName: (r) => r.packageName,
      loading: rejoinsLoading
    },
  ];

  const handleHardDelete = () => {
    if (!confirmId) return;
    const entity = entities.find(e => e.key === confirmId.entity);
    entity?.hardDelete(confirmId.id);
    if (confirmId.entity !== 'rejoins') {
      toast.success('Permanently deleted');
    }
    setConfirmId(null);
  };

  return (
    <div>
      <PageHeader title="Trash" back />
      <div className="p-5">
        <Tabs defaultValue="leads">
          <TabsList className="w-full bg-muted h-9 overflow-x-auto no-scrollbar justify-start">
            {entities.map(e => (
              <TabsTrigger key={e.key} value={e.key} className="flex-1 text-[10px] uppercase font-bold tracking-wider">
                {e.label} {!e.loading && e.items.length > 0 ? `(${e.items.length})` : ''}
              </TabsTrigger>
            ))}
          </TabsList>
          {entities.map(e => (
            <TabsContent key={e.key} value={e.key} className="mt-4">
              {e.loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : e.items.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">No trashed {e.label.toLowerCase()}</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {e.items.map(item => (
                    <div key={item.id} className="px-4 py-3">
                      <p className="text-sm font-medium">{e.getName(item)}</p>
                      <p className="text-xs text-muted-foreground">Deleted {new Date(item.deletedAt || item.createdAt).toLocaleDateString()}</p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full text-xs text-primary h-7" onClick={() => { e.restore(item.id); if(e.key !== 'rejoins') toast.success('Restored'); }}>Restore</Button>
                        <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive h-7" onClick={() => setConfirmId({ entity: e.key, id: item.id, name: e.getName(item) })}>Delete permanently</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!confirmId} onOpenChange={open => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete permanently?</DialogTitle>
            <DialogDescription>This cannot be undone. "{confirmId?.name}" will be permanently removed.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-full" onClick={handleHardDelete}>Delete forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

