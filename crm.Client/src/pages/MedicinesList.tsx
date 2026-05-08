import { useState, useMemo } from 'react';
import { useMedicines, useMedicineMutations } from '@/hooks/useMedicines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
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
  Plus, 
  Search, 
  Pill, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ArrowLeft,
  Loader2,
  Package
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function MedicinesList() {
  const navigate = useNavigate();
  const { data: medicines = [], isLoading } = useMedicines();
  const { createMedicine, updateMedicine, deleteMedicine, isPending } = useMedicineMutations();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return medicines
      .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1));
  }, [medicines, search]);

  const openNew = () => { setEditId(null); setName(''); setPrice(''); setActive(true); setShowForm(true); };
  
  const openEdit = (med: any) => {
    setEditId(med.id); 
    setName(med.name); 
    setPrice(String(med.price)); 
    setActive(med.isActive); 
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim() || !price) return;
    const payload = { 
      name: name.trim(), 
      price: parseFloat(price), 
      isActive: active 
    };
    
    if (editId) {
      updateMedicine.mutate({ id: editId, medicine: { ...payload, id: editId } }, {
        onSuccess: () => setShowForm(false)
      });
    } else {
      createMedicine.mutate(payload, {
        onSuccess: () => setShowForm(false)
      });
    }
  };

  const handleToggleActive = (e: React.MouseEvent, med: any) => {
    e.stopPropagation();
    updateMedicine.mutate({ 
      id: med.id, 
      medicine: { ...med, isActive: !med.isActive, id: med.id } 
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[30%] bg-blue-50/30 rounded-full blur-[100px] -z-10" />

      {/* Header Area */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl bg-slate-50 border border-slate-100 shadow-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medicines</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Catalog Management</p>
            </div>
          </div>
          <Button 
            onClick={openNew}
            className="rounded-xl h-11 px-5 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold text-xs gap-2"
          >
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            placeholder="Search medicines..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-11 h-12 bg-slate-50 border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Medicines List */}
      <div className="px-6 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
              <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Catalog...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((med) => (
            <div 
              key={med.id}
              onClick={() => openEdit(med)}
              className={`group relative flex items-center p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98] cursor-pointer
                ${!med.isActive 
                  ? 'bg-slate-50/50 border-slate-100 opacity-75' 
                  : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-indigo-50/5'
                }`}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                ${!med.isActive ? 'bg-slate-100' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}>
                <Pill className={`h-6 w-6 ${!med.isActive ? 'text-slate-400' : 'text-indigo-600'}`} />
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 truncate tracking-tight">{med.name}</h3>
                  {!med.isActive && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-[8px] font-black uppercase text-slate-500">Inactive</span>
                  )}
                </div>
                <p className="text-sm font-bold text-indigo-600 mt-0.5">{formatCurrency(med.price)}</p>
              </div>

              <div className="flex items-center gap-1">
                <div onClick={e => e.stopPropagation()}>
                  <Switch 
                    checked={med.isActive} 
                    onCheckedChange={(val) => handleToggleActive({ stopPropagation: () => {} } as any, med)} 
                    className="scale-75 data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl min-w-[140px]">
                    <DropdownMenuItem onClick={() => openEdit(med)} className="gap-2 font-bold text-xs py-2.5 cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5 text-slate-400" /> Edit Medicine
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); setMedicineToDelete(med.id); }}
                      className="gap-2 font-bold text-xs py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Move to Trash
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
              <Pill className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No medicines found</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
              {search ? `No results for "${search}". Try a different keyword.` : "Your medicine catalog is currently empty."}
            </p>
            {!search && (
              <Button onClick={openNew} variant="outline" className="mt-8 rounded-xl h-11 font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                Add First Medicine
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-2xl p-6 overflow-hidden">
          <DialogHeader className="text-left mb-2">
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {editId ? 'Edit Medicine' : 'Add Medicine'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Configure medicine pricing and active status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Medicine Name</Label>
              <div className="relative">
                <Pill className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Health Tonic A"
                  className="h-12 pl-10 bg-slate-50 border-slate-100 rounded-xl text-sm font-bold placeholder:font-medium transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/5" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Selling Price (₹)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input 
                  type="number" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="0.00"
                  className="h-12 pl-8 bg-slate-50 border-slate-100 rounded-xl text-lg font-bold transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/5" 
                  min={0} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Active in Catalog
                </Label>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Disable to hide from selection</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} className="data-[state=checked]:bg-emerald-500 scale-110" />
            </div>
          </div>

          <DialogFooter className="mt-4 flex-row gap-3">
            <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold text-slate-500 m-0" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-[2] rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 m-0 disabled:opacity-50" 
              onClick={handleSave}
              disabled={isPending || !name || !price}
            >
              {isPending ? '...' : editId ? 'Update Medicine' : 'Save Medicine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!medicineToDelete} onOpenChange={(open) => !open && setMedicineToDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-32px)] max-w-md rounded-2xl p-6">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed font-medium">
              Are you sure you want to move this medicine to the trash? It will be hidden from the catalog but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-4">
            <AlertDialogCancel className="flex-1 rounded-xl h-11 text-xs font-bold m-0 border-slate-100">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 rounded-xl h-11 text-xs font-bold m-0 bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (medicineToDelete) {
                  deleteMedicine.mutate({ id: medicineToDelete }, {
                    onSuccess: () => setMedicineToDelete(null)
                  });
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
