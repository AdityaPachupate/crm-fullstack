import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PageHeader from '@/components/layout/PageHeader';
import { LookupBadge } from '@/components/ui/LookupBadge';
import { formatCurrency } from '@/lib/helpers';
import { CalendarIcon, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLeads } from '@/hooks/useLeads';
import { usePackages } from '@/hooks/usePackages';
import { useMedicines } from '@/hooks/useMedicines';
import { useEnrollments } from '@/hooks/useEnrollments';

export default function CreateEnrollment() {
  const navigate = useNavigate();
  
  // Data Fetching
  const { data: leadsData, isLoading: loadingLeads } = useLeads({ pageSize: 100 });
  const { data: packages, isLoading: loadingPackages } = usePackages();
  const { data: medicines, isLoading: loadingMedicines } = useMedicines();
  const { createEnrollment } = useEnrollments();

  // Form State
  const [leadId, setLeadId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [amountPaid, setAmountPaid] = useState('0');
  const [medItems, setMedItems] = useState<{ medicineId: string; quantity: number }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeLeads = leadsData?.items || [];
  const activePackages = packages || [];
  const activeMedicines = medicines?.filter(m => m.isActive) || [];

  const selectedPkg = useMemo(() => 
    activePackages.find(p => p.id === packageId), 
    [activePackages, packageId]
  );

  const medTotal = useMemo(() => {
    return medItems.reduce((sum, item) => {
      const med = activeMedicines.find(m => m.id === item.medicineId);
      return sum + (med ? med.price * item.quantity : 0);
    }, 0);
  }, [medItems, activeMedicines]);

  const grandTotal = (selectedPkg?.cost || 0) + medTotal;
  const pending = grandTotal - (parseFloat(amountPaid) || 0);

  const addMedRow = () => setMedItems([...medItems, { medicineId: '', quantity: 1 }]);
  const removeMedRow = (i: number) => setMedItems(medItems.filter((_, idx) => idx !== i));
  const updateMedRow = (i: number, field: string, value: any) => 
    setMedItems(medItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!leadId) e.leadId = 'Select a lead';
    if (!packageId) e.packageId = 'Select a package';
    if (!startDate) e.startDate = 'Select a start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isSubmitting = createEnrollment.isPending;

  const handleSubmit = () => {
    if (!validate() || !startDate) return;

    createEnrollment.mutate({
      leadId,
      packageId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      amountPaid: parseFloat(amountPaid) || 0,
      medicineItems: medItems.filter(m => m.medicineId)
    }, {
      onSuccess: () => {
        toast.success('Enrollment created successfully');
        navigate('/enrollments');
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      <PageHeader title="New Enrollment" back />
      
      <div className="space-y-6 p-5 max-w-2xl mx-auto w-full">
        {/* Lead Selection */}
        <div>
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Patient</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="mt-1.5 h-12 rounded-xl bg-slate-50 border-slate-200 text-sm">
              <SelectValue placeholder={loadingLeads ? "Loading patients..." : "Choose a patient"} />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[300px]">
              {activeLeads.map(l => (
                <SelectItem key={l.id} value={l.id} className="rounded-lg py-2">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="font-semibold text-sm">{l.name}</span>
                    <LookupBadge category="LeadStatus" code={l.status} />
                  </div>
                </SelectItem>
              ))}
              {activeLeads.length === 0 && !loadingLeads && (
                <div className="p-4 text-center text-xs text-muted-foreground">No patients found</div>
              )}
            </SelectContent>
          </Select>
          {errors.leadId && <p className="mt-1 text-xs text-destructive ml-1 font-medium">{errors.leadId}</p>}
        </div>

        {/* Package Selection */}
        <div>
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Package</Label>
          <Select value={packageId} onValueChange={setPackageId}>
            <SelectTrigger className="mt-1.5 h-12 rounded-xl bg-slate-50 border-slate-200 text-sm">
              <SelectValue placeholder={loadingPackages ? "Loading packages..." : "Choose a package"} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {activePackages.map(p => (
                <SelectItem key={p.id} value={p.id} className="rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">{p.durationDays} days · {formatCurrency(p.cost)}</span>
                  </div>
                </SelectItem>
              ))}
              {activePackages.length === 0 && !loadingPackages && (
                <div className="p-4 text-center text-xs text-muted-foreground">No packages available</div>
              )}
            </SelectContent>
          </Select>
          {errors.packageId && <p className="mt-1 text-xs text-destructive ml-1 font-medium">{errors.packageId}</p>}
        </div>

        {/* Start Date */}
        <div>
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "mt-1.5 w-full h-12 justify-start text-left font-normal rounded-xl bg-slate-50 border-slate-200 text-sm",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-slate-100" align="start">
              <Calendar 
                mode="single" 
                selected={startDate} 
                onSelect={setStartDate} 
                className="p-3 pointer-events-auto" 
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && <p className="mt-1 text-xs text-destructive ml-1 font-medium">{errors.startDate}</p>}
        </div>

        {/* Medicines Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Medicines (Optional)</Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-3 rounded-lg"
              onClick={addMedRow}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {medItems.map((item, i) => (
              <div key={i} className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 relative group animate-in slide-in-from-top-2 duration-200">
                <Select 
                  value={item.medicineId} 
                  onValueChange={v => updateMedRow(i, 'medicineId', v)}
                >
                  <SelectTrigger className="w-full h-10 rounded-lg bg-white border-slate-200 text-sm">
                    <SelectValue placeholder={loadingMedicines ? "Loading..." : "Select medicine"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {activeMedicines.map(m => (
                      <SelectItem key={m.id} value={m.id} className="rounded-lg">
                        {m.name} ({formatCurrency(m.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center justify-between w-full mt-3">
                  <div className="flex items-center h-10 px-1 bg-white rounded-lg border border-slate-200">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md hover:bg-slate-50"
                      onClick={() => updateMedRow(i, 'quantity', Math.max(1, item.quantity - 1))}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md hover:bg-slate-50"
                      onClick={() => updateMedRow(i, 'quantity', item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-destructive hover:bg-destructive/5 rounded-lg"
                    onClick={() => removeMedRow(i)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Paid */}
        <div>
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Payment</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <Input 
              type="number" 
              value={amountPaid} 
              onChange={e => setAmountPaid(e.target.value)} 
              placeholder="0" 
              className="h-12 pl-8 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold focus:bg-white" 
            />
          </div>
        </div>

        {/* Bill Preview Card */}
        {selectedPkg && (
          <Card className="border-none bg-indigo-50/50 shadow-none overflow-hidden rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Package Fee ({selectedPkg.name})</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedPkg.cost)}</span>
              </div>
              {medTotal > 0 && (
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Medicines Total</span>
                  <span className="font-bold text-slate-900">{formatCurrency(medTotal)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-indigo-100 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black text-indigo-900 tracking-tight">{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance Due</span>
                  <span className={cn(
                    "text-sm font-black",
                    pending > 0 ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {pending > 0 ? formatCurrency(pending) : 'Fully Paid'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-100 flex gap-3 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex-1 h-12 rounded-xl font-bold text-slate-500"
        >
          Cancel
        </Button>
        <Button 
          className="flex-[2] h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          onClick={handleSubmit}
          disabled={!leadId || !packageId || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Confirm Enrollment'
          )}
        </Button>
      </div>
    </div>
  );
}
