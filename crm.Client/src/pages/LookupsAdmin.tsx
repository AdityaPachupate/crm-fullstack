// Lookups Administration Page
import { useState, useMemo } from 'react';
import { useLookups, useLookupMutations } from '@/hooks/useLookups';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import PageHeader from '@/components/layout/PageHeader';
import { LookupCategory, LookupValue } from '@/types';
import { 
  ChevronDown, 
  Plus, 
  Settings2, 
  Search, 
  Filter, 
  LayoutGrid,
  Info,
  Layers,
  Database,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LookupsAdmin() {
  const { data: lookups = [], isLoading } = useLookups(true);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(lookups.map(l => l.category)));
    // Only show categories that are currently supported by the backend data model
    const standard = ['LeadSource', 'LeadReason'];
    return Array.from(new Set([...standard, ...cats])).sort();
  }, [lookups]);

  const formatTitle = (cat: string) => {
    return cat.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <PageHeader 
        title="Configure Dropdowns" 
        subtitle="Manage your CRM's dynamic data options"
        icon={Database}
        back={true}
      />

      <div className="px-6 py-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Categories List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading configurations...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Database className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900">No categories found</p>
            </div>
          ) : (
            categories.map(cat => (
              <LookupSection key={cat} category={cat} title={formatTitle(cat)} />
            ))
          )}
        </div>

        {/* Help Tip */}
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-3">
          <Info className="h-5 w-5 text-indigo-600 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-900">Configuration Tip</p>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              Disabling a value will hide it from new dropdowns but keep it on existing records. 
              Changes take effect immediately across all forms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LookupSection({ category, title }: { category: string; title: string }) {
  const { data: lookups = [] } = useLookups(true);
  const { addLookup, deleteLookup, restoreLookup } = useLookupMutations(true);
  
  const items = lookups.filter(l => l.category === category);
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<LookupValue | null>(null);

  const activeCount = items.filter(i => !i.deletedAt).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim() || !newCode.trim()) return;
    
    const code = newCode.trim().toLowerCase().replace(/\s/g, '_');
    
    try {
      await addLookup({ 
        category: category as LookupCategory, 
        code, 
        displayName: newDisplayName.trim() 
      });
      setNewDisplayName('');
      setNewCode('');
      setIsAdding(false);
      toast.success('Value added successfully');
    } catch (err) {
      toast.error('Failed to add value. Code may already exist.');
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteLookup({ id: confirmDelete.id, isPermanent: true });
      setConfirmDelete(null);
      toast.success('Value removed forever');
    } catch (err) {
      toast.error('Failed to remove value');
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-2xl bg-white border border-slate-100 px-5 py-4 shadow-sm hover:border-indigo-200 transition-all text-left">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
            open ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400"
          )}>
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {activeCount} active values • {category}
            </p>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", open && "rotate-180 text-indigo-600")} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2 space-y-1">
          {items.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Database className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 italic font-medium">No values configured yet.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-colors",
                item.deletedAt ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50"
              )}>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-bold",
                    item.deletedAt ? "text-slate-400 line-through" : "text-slate-700"
                  )}>
                    {item.displayName}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    CODE: {item.code}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {item.deletedAt && (
                    <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest text-slate-400 border-slate-200 px-2">
                      Inactive
                    </Badge>
                  )}
                  <div className="flex items-center gap-3">
                    {item.deletedAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(item);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Switch 
                      checked={!item.deletedAt}
                      onCheckedChange={() => item.deletedAt ? restoreLookup(item.id) : deleteLookup({ id: item.id })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Add New Value Button/Form */}
          <div className="mt-2 pt-2 border-t border-slate-50">
            {isAdding ? (
              <form onSubmit={handleAdd} className="p-3 bg-slate-50 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Display Name</Label>
                    <Input 
                      value={newDisplayName}
                      onChange={e => setNewDisplayName(e.target.value)}
                      placeholder="e.g. Walk-in"
                      className="h-9 rounded-lg bg-white border-slate-200 text-sm font-bold"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Code</Label>
                    <Input 
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      placeholder="e.g. walk_in"
                      className="h-9 rounded-lg bg-white border-slate-200 text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1 bg-slate-900 rounded-lg font-bold text-xs h-9">
                    Save Value
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-lg font-bold text-xs h-9">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full h-10 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center justify-center gap-2"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4" />
                Add new {title.toLowerCase()}
              </Button>
            )}
          </div>
        </div>
      </CollapsibleContent>

      {/* Permanent Delete Confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-3xl border-none p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Wipe Forever?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-black text-slate-900">"{confirmDelete?.displayName}"</span>? 
              This action <span className="text-rose-500 font-bold underline">cannot be undone</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3">
            <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold text-slate-600" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100" 
              onClick={handlePermanentDelete}
            >
              Yes, Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
