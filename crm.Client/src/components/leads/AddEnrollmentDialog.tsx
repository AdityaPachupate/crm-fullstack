import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency, addDays, todayStr } from '@/lib/helpers';
import { usePackages } from '@/hooks/usePackages';
import { useMedicines } from '@/hooks/useMedicines';
import { useEnrollments } from '@/hooks/useEnrollments';
import { EnrollmentDto, Medicine } from '@/types';

interface AddEnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  enrollment?: EnrollmentDto; // If provided, we are in Edit mode
}

export function AddEnrollmentDialog({ isOpen, onClose, leadId, enrollment }: AddEnrollmentDialogProps) {
  const { data: packages, isLoading: loadingPackages } = usePackages();
  const { data: medicines, isLoading: loadingMedicines } = useMedicines();
  const { createEnrollment, updateEnrollment } = useEnrollments();

  // Form State
  const [packageId, setPackageId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [amountPaid, setAmountPaid] = useState('0');
  const [medItems, setMedItems] = useState<{ medicineId: string; quantity: number }[]>([]);

  // Reset form when opening/closing or changing enrollment
  useEffect(() => {
    if (enrollment) {
      setPackageId(enrollment.packageId);
      setStartDate(new Date(enrollment.startDate));
      setAmountPaid(enrollment.bill?.amountPaid.toString() || '0');
      // Note: Backend might not return medItems in EnrollmentDto directly, 
      // depends on the mapping in GetLeadsByIdHandler. In that handler, 
      // BillDto doesn't have medItems. This is a potential limitation.
      setMedItems([]); 
    } else {
      setPackageId('');
      setStartDate(new Date());
      setAmountPaid('0');
      setMedItems([]);
    }
  }, [enrollment, isOpen]);

  const selectedPkg = useMemo(() => 
    packages?.find(p => p.id === packageId), 
    [packages, packageId]
  );

  const medTotal = useMemo(() => {
    return medItems.reduce((sum, item) => {
      const med = medicines?.find(m => m.id === item.medicineId);
      return sum + (med ? med.price * item.quantity : 0);
    }, 0);
  }, [medItems, medicines]);

  const grandTotal = (selectedPkg?.cost || 0) + medTotal;
  const pending = grandTotal - (parseFloat(amountPaid) || 0);

  const addMedRow = () => setMedItems([...medItems, { medicineId: '', quantity: 1 }]);
  const removeMedRow = (index: number) => setMedItems(medItems.filter((_, i) => i !== index));
  const updateMedRow = (index: number, field: string, value: any) => {
    setMedItems(medItems.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const isSubmitting = createEnrollment.isPending || updateEnrollment.isPending;

  const handleConfirm = () => {
    if (!packageId || !startDate) return;

    if (enrollment) {
      updateEnrollment.mutate({
        id: enrollment.id,
        leadId,
        packageId,
        startDate: format(startDate, 'yyyy-MM-dd'),
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createEnrollment.mutate({
        leadId,
        packageId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        amountPaid: parseFloat(amountPaid) || 0,
        medicineItems: medItems.filter(m => m.medicineId)
      }, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto scrollbar-hide p-0 gap-0">
        <DialogHeader className="p-6 pb-2 text-left">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
            {enrollment ? 'Edit Enrollment' : 'New Enrollment'}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Assign treatment package and medicines</p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Package Selection */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Package</Label>
            <Select value={packageId} onValueChange={setPackageId} disabled={enrollment !== undefined}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm">
                <SelectValue placeholder={loadingPackages ? "Loading packages..." : "Choose a package"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {packages?.map(p => (
                  <SelectItem key={p.id} value={p.id} className="rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.durationDays} days · {formatCurrency(p.cost)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal rounded-xl bg-slate-50 border-slate-200 text-sm",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {!enrollment && (
            <>
              {/* Medicines Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Medicines (Optional)</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 rounded-lg"
                    onClick={addMedRow}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {medItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 group animate-in flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 relative">
                      <Select 
                        value={item.medicineId} 
                        onValueChange={v => updateMedRow(i, 'medicineId', v)}
                      >
                        <SelectTrigger className="w-full h-10 rounded-lg bg-white border-slate-200 text-xs">
                          <SelectValue placeholder={loadingMedicines ? "Loading..." : "Select medicine"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {medicines?.filter(m => m.isActive).map(m => (
                            <SelectItem key={m.id} value={m.id} className="rounded-lg">
                              {m.name} ({formatCurrency(m.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center justify-between w-full mt-1">
                        <div className="flex items-center h-9 px-1 bg-white rounded-lg border border-slate-200">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-md hover:bg-slate-50"
                            onClick={() => updateMedRow(i, 'quantity', Math.max(1, item.quantity - 1))}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-md hover:bg-slate-50"
                            onClick={() => updateMedRow(i, 'quantity', item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/5 rounded-lg"
                          onClick={() => removeMedRow(i)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Paid */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₹</span>
                  <Input 
                    type="number" 
                    value={amountPaid} 
                    onChange={e => setAmountPaid(e.target.value)} 
                    className="h-11 pl-7 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Minimal Bill Preview */}
              {selectedPkg && (
                <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-medium text-slate-500">
                    <span>Package Fee</span>
                    <span>{formatCurrency(selectedPkg.cost)}</span>
                  </div>
                  {medTotal > 0 && (
                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
                      <span>Medicines Total</span>
                      <span>{formatCurrency(medTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-indigo-100 pt-2 mt-1">
                    <span>Grand Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mt-1">
                    <span className="text-slate-400">Balance Due</span>
                    <span className={pending > 0 ? "text-rose-600" : "text-emerald-600"}>
                      {pending > 0 ? formatCurrency(pending) : 'Settled'}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex-row gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 rounded-xl h-11 font-bold text-slate-500 m-0"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!packageId || isSubmitting}
            className="flex-[2] rounded-xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 m-0"
          >
            {isSubmitting ? '...' : (enrollment ? 'Update' : 'Enrol')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
