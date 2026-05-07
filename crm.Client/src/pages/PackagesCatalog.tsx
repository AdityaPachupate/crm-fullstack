import { useState, useMemo } from 'react';
import { usePackages } from '@/hooks/usePackages';
import { packagesApi } from '@/api/packages.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Package, 
  Clock, 
  DollarSign, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function PackagesCatalog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: packages = [], isLoading } = usePackages();
  
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredPackages = useMemo(() => {
    return packages.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [packages, search]);

  const createMutation = useMutation({
    mutationFn: packagesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package created successfully');
      setShowForm(false);
    },
    onError: () => toast.error('Failed to create package')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, pkg }: { id: string, pkg: any }) => packagesApi.update(id, pkg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package updated successfully');
      setShowForm(false);
    },
    onError: () => toast.error('Failed to update package')
  });

  const deleteMutation = useMutation({
    mutationFn: packagesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package moved to trash');
    },
    onError: () => toast.error('Failed to delete package')
  });

  const openNew = () => {
    setEditId(null);
    setName('');
    setDuration('');
    setCost('');
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (pkg: any) => {
    setEditId(pkg.id);
    setName(pkg.name);
    setDuration(String(pkg.durationDays));
    setCost(String(pkg.cost));
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!duration || parseInt(duration) < 1) e.duration = 'Minimum 1 day';
    if (!cost || parseFloat(cost) < 0) e.cost = 'Minimum 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      name: name.trim(),
      durationDays: parseInt(duration),
      cost: parseFloat(cost)
    };

    if (editId) {
      updateMutation.mutate({ id: editId, pkg: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Move this package to trash?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-[-1] opacity-[0.4] pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
             backgroundSize: '24px 24px' 
           }} 
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Treatment Packages</h1>
          </div>
          <Button onClick={openNew} className="rounded-full h-10 px-5 gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Package</span>
          </Button>
        </div>
        
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search packages..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 bg-muted/40 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading catalog...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold">No packages found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
              {search ? `We couldn't find any packages matching "${search}"` : "You haven't added any treatment packages yet."}
            </p>
            {!search && (
              <Button variant="outline" className="mt-6 rounded-full" onClick={openNew}>
                Create your first package
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPackages.map(pkg => (
              <Card 
                key={pkg.id} 
                className="group border-none shadow-sm hover:shadow-md transition-all duration-200 bg-card/60 backdrop-blur-sm cursor-pointer"
                onClick={() => openEdit(pkg)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{pkg.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {pkg.durationDays} Days
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] font-bold text-primary">{formatCurrency(pkg.cost)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-40 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(pkg)} className="gap-2">
                          <Edit2 className="h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(pkg.id)} className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" /> Move to Trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editId ? 'Edit Package' : 'New Package'}
            </DialogTitle>
            <DialogDescription>
              Configure treatment duration and pricing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Package Name</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Chronic Management" 
                className="h-12 bg-muted/30 border-none rounded-xl"
              />
              {errors.name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Duration (Days)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={e => setDuration(e.target.value)} 
                    placeholder="30" 
                    className="h-12 pl-10 bg-muted/30 border-none rounded-xl"
                  />
                </div>
                {errors.duration && <p className="text-[10px] text-destructive font-bold ml-1">{errors.duration}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Cost</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={cost} 
                    onChange={e => setCost(e.target.value)} 
                    placeholder="5000" 
                    className="h-12 pl-10 bg-muted/30 border-none rounded-xl"
                  />
                </div>
                {errors.cost && <p className="text-[10px] text-destructive font-bold ml-1">{errors.cost}</p>}
              </div>
            </div>

            {name && duration && cost && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[150px]">{name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{duration} Days</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary">{formatCurrency(parseFloat(cost) || 0)}</p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-start">
            <Button 
              className="w-full rounded-full h-12 text-sm font-bold shadow-lg shadow-primary/20" 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                editId ? 'Update Package' : 'Create Package'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
