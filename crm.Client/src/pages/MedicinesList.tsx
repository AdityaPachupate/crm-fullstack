import { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/helpers';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function MedicinesList() {
  const { medicines, addMedicine, updateMedicine } = useCRM();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return medicines
      .filter(m => !m.deletedAt)
      .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));
  }, [medicines, search]);

  const openNew = () => { setEditId(null); setName(''); setPrice(''); setActive(true); setShowForm(true); };
  const openEdit = (id: string) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    setEditId(id); setName(med.name); setPrice(String(med.price)); setActive(med.active); setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim() || !price) return;
    if (editId) {
      updateMedicine(editId, { name: name.trim(), price: parseFloat(price), active });
      toast.success('Medicine updated');
    } else {
      addMedicine({ name: name.trim(), price: parseFloat(price), active });
      toast.success('Medicine added');
    }
    setShowForm(false);
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateMedicine(id, { active: !currentActive });
    toast.success(!currentActive ? 'Medicine activated' : 'Medicine deactivated');
  };

  return (
    <div>
      <PageHeader title="Medicines" right={<Button size="sm" className="rounded-full text-xs h-8 px-3" onClick={openNew}><Plus className="mr-1 h-3 w-3" /> Add</Button>} />
      <div className="px-5 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-muted border-0 rounded-lg text-sm" />
        </div>
      </div>
      <div className="divide-y">
        {filtered.slice(0, visibleCount).map(med => (
          <div key={med.id} className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-muted/50 transition-colors ${!med.active ? 'opacity-50' : ''}`} onClick={() => openEdit(med.id)}>
            <div>
              <p className="text-sm font-medium">{med.name}</p>
              <p className="text-sm text-primary font-medium">{formatCurrency(med.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              {!med.active && <span className="text-[10px] text-muted-foreground">Inactive</span>}
              <Switch checked={med.active} onCheckedChange={() => handleToggleActive(med.id, med.active)} onClick={e => e.stopPropagation()} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No medicines found</p>}
      </div>
      {visibleCount < filtered.length && (
        <div className="p-5">
          <Button variant="outline" className="w-full rounded-full text-xs" onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>Load more</Button>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-2xl p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editId ? 'Edit Medicine' : 'Add Medicine'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Configure medicine details and pricing</p>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Medicine Name</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Paracetamol"
                className="h-11 bg-muted/30 border-none rounded-xl text-sm" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Price</Label>
              <Input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                placeholder="0.00"
                className="h-11 bg-muted/30 border-none rounded-xl text-sm" 
                min={0} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent">
              <Label className="text-sm font-semibold flex items-center gap-2">
                Active Status
              </Label>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button className="w-full rounded-xl h-11 text-xs font-bold shadow-lg" onClick={handleSave}>
              {editId ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
