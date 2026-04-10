import { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/helpers';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PackagesCatalog() {
  const { packages, addPackage, updatePackage } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activePackages = useMemo(() => packages.filter(p => !p.deletedAt), [packages]);

  const openNew = () => { setEditId(null); setName(''); setDuration(''); setCost(''); setErrors({}); setShowForm(true); };
  const openEdit = (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    setEditId(id); setName(pkg.name); setDuration(String(pkg.durationDays)); setCost(String(pkg.cost)); setErrors({}); setShowForm(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (name.trim().length > 100) e.name = 'Max 100 characters';
    const dup = activePackages.find(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== editId);
    if (dup) e.name = 'A package with this name already exists';
    if (!duration || parseInt(duration) < 1) e.duration = 'Minimum 1 day';
    if (!cost || parseFloat(cost) < 0) e.cost = 'Minimum 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      updatePackage(editId, { name: name.trim(), durationDays: parseInt(duration), cost: parseFloat(cost) });
      toast.success('Package updated');
    } else {
      addPackage({ name: name.trim(), durationDays: parseInt(duration), cost: parseFloat(cost) });
      toast.success('Package created');
    }
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader title="Packages" right={<Button size="sm" variant="default" className="rounded-full text-xs h-8 px-3" onClick={openNew}><Plus className="mr-1 h-3 w-3" /> New package</Button>} />
      <div className="grid grid-cols-2 gap-3 p-5">
        {activePackages.length === 0 && <p className="col-span-2 py-16 text-center text-sm text-muted-foreground">No packages yet</p>}
        {activePackages.map(pkg => (
          <Card key={pkg.id} className="border shadow-none cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openEdit(pkg.id)}>
            <CardContent className="p-4">
              <p className="text-sm font-medium">{pkg.name}</p>
              <span className="mt-2 inline-block text-xs text-muted-foreground">{pkg.durationDays} days</span>
              <p className="mt-1 text-lg font-semibold text-primary">{formatCurrency(pkg.cost)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Package' : 'New Package'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Package Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Full Body Detox" className="mt-1.5 h-10 rounded-lg" maxLength={100} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Duration (days)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" className="mt-1.5 h-10 rounded-lg" min={1} />
              {errors.duration && <p className="mt-1 text-xs text-destructive">{errors.duration}</p>}
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Cost</Label>
              <Input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" className="mt-1.5 h-10 rounded-lg" min={0} />
              {errors.cost && <p className="mt-1 text-xs text-destructive">{errors.cost}</p>}
            </div>
            {name && duration && cost && (
              <Card className="border shadow-none bg-muted/50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium">{name}</p>
                  <span className="text-xs text-muted-foreground">{duration} days</span>
                  <p className="mt-1 text-lg font-semibold text-primary">{formatCurrency(parseFloat(cost) || 0)}</p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button className="w-full rounded-full h-11" onClick={handleSave}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
