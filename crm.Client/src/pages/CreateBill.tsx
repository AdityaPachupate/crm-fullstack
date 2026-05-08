import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useMedicines } from '@/hooks/useMedicines';
import { useCreateBill } from '@/hooks/useBills';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/helpers';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  Search, 
  User, 
  Receipt, 
  Pill, 
  Wallet,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CreateBill() {
  const navigate = useNavigate();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: medicines, isLoading: medicinesLoading } = useMedicines();
  const createBill = useCreateBill();

  const [leadId, setLeadId] = useState('');
  const [openLeadSelect, setOpenLeadSelect] = useState(false);
  const [packageAmount, setPackageAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [medItems, setMedItems] = useState<{ medicineId: string; quantity: number }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeLeads = useMemo(() => leads?.items?.filter(l => !l.deletedAt) || [], [leads]);
  const activeMedicines = useMemo(() => medicines?.filter(m => !m.deletedAt && m.isActive) || [], [medicines]);

  const selectedLead = activeLeads.find(l => l.id === leadId);

  const medTotal = medItems.reduce((sum, item) => {
    const med = activeMedicines.find(m => m.id === item.medicineId);
    return sum + (med ? med.price * item.quantity : 0);
  }, 0);
  
  const pkgAmt = parseFloat(packageAmount) || 0;
  const grandTotal = pkgAmt + medTotal;
  const paidAmt = parseFloat(amountPaid) || 0;
  const pending = grandTotal - paidAmt;

  const addMedRow = () => setMedItems([...medItems, { medicineId: '', quantity: 1 }]);
  const removeMedRow = (i: number) => setMedItems(medItems.filter((_, idx) => idx !== i));
  const updateMedRow = (i: number, field: string, value: any) => 
    setMedItems(medItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!leadId) e.leadId = 'Please select a patient';
    if (!pkgAmt && medItems.filter(m => m.medicineId).length === 0) {
      e.items = 'Please add a package amount or at least one medicine';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    createBill.mutate({
      leadId,
      enrollmentId: null,
      rejoinRecordId: null,
      packageAmount: pkgAmt,
      amountPaid: paidAmt,
      medicineItems: medItems.filter(m => m.medicineId).map(m => ({
        medicineId: m.medicineId,
        quantity: m.quantity
      }))
    }, {
      onSuccess: () => navigate(-1)
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-6 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Bill</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Generate new invoice</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Patient Selection */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Patient Details</Label>
          <Popover open={openLeadSelect} onOpenChange={setOpenLeadSelect}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openLeadSelect}
                className={cn(
                  "w-full justify-between h-14 rounded-2xl border-none shadow-sm bg-slate-50 px-5 text-sm font-bold transition-all hover:bg-slate-100",
                  !leadId && "text-slate-400 font-medium"
                )}
              >
                <div className="flex items-center gap-3">
                  <User className={cn("h-4 w-4", leadId ? "text-indigo-600" : "text-slate-400")} />
                  {leadId ? selectedLead?.name : "Select patient..."}
                </div>
                <Search className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-48px)] max-w-[400px] p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
              <Command className="rounded-none">
                <CommandInput placeholder="Search patient name..." className="h-12 border-none ring-0 focus:ring-0 font-medium" />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty className="py-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No patient found.</CommandEmpty>
                  <CommandGroup>
                    {activeLeads.map((l) => (
                      <CommandItem
                        key={l.id}
                        value={l.name}
                        onSelect={() => {
                          setLeadId(l.id);
                          setOpenLeadSelect(false);
                          setErrors(prev => ({ ...prev, leadId: '' }));
                        }}
                        className="px-5 py-3 font-bold text-sm flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span>{l.name}</span>
                          <span className="text-[10px] font-medium text-slate-400">{l.phone}</span>
                        </div>
                        <Check className={cn("h-4 w-4 text-indigo-600 opacity-0 transition-opacity", leadId === l.id && "opacity-100")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.leadId && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1">{errors.leadId}</p>}
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Package Amount (₹)</Label>
            <div className="relative">
              <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                type="number" 
                value={packageAmount} 
                onChange={e => setPackageAmount(e.target.value)} 
                placeholder="0.00" 
                className="h-14 pl-11 rounded-2xl border-none shadow-sm bg-slate-50 text-sm font-black focus-visible:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Amount Paid (₹)</Label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                type="number" 
                value={amountPaid} 
                onChange={e => setAmountPaid(e.target.value)} 
                placeholder="0.00" 
                className="h-14 pl-11 rounded-2xl border-none shadow-sm bg-slate-50 text-sm font-black text-indigo-600 focus-visible:ring-indigo-500" 
              />
            </div>
          </div>
        </div>

        {/* Medicines Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Medicine Prescription</Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={addMedRow}
              className="h-7 px-3 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-slate-800"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {medItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Select value={item.medicineId} onValueChange={v => updateMedRow(i, 'medicineId', v)}>
                  <SelectTrigger className="flex-1 h-12 rounded-xl border-none shadow-sm bg-slate-50 text-xs font-bold text-slate-600 px-4">
                    <SelectValue placeholder="Select Medicine" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {activeMedicines.map(m => (
                      <SelectItem key={m.id} value={m.id} className="text-xs font-bold py-2.5">
                        <div className="flex justify-between items-center w-full min-w-[200px]">
                          <span>{m.name}</span>
                          <span className="text-slate-400 ml-4 font-black">{formatCurrency(m.price)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center bg-slate-50 rounded-xl shadow-inner px-1 h-12">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900" 
                    onClick={() => updateMedRow(i, 'quantity', Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900" 
                    onClick={() => updateMedRow(i, 'quantity', item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors" 
                  onClick={() => removeMedRow(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {medItems.length === 0 && (
              <div className="py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                <Pill className="h-8 w-8 text-slate-200" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No medicines added</p>
              </div>
            )}
          </div>
          {errors.items && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.items}</p>}
        </div>

        {/* Summary Card */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2 pb-4 border-b border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subtotal (Pkg)</span>
                <span className="font-bold text-slate-600">{formatCurrency(pkgAmt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Medicines</span>
                <span className="font-bold text-slate-600">{formatCurrency(medTotal)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Grand Total</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(grandTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Pending</p>
                <p className={cn(
                  "text-xl font-black tracking-tight",
                  pending > 0 ? "text-rose-500" : "text-emerald-500"
                )}>
                  {formatCurrency(Math.max(0, pending))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button Container */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10 z-40">
        <Button 
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100" 
          onClick={handleSubmit}
          disabled={createBill.isPending}
        >
          {createBill.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            "Generate Bill"
          )}
        </Button>
      </div>
    </div>
  );
}
