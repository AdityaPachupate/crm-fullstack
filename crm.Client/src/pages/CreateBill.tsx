import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/helpers';
import { BillMedicineItem } from '@/types';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateBill() {
  const { leads, medicines, addBill } = useCRM();
  const navigate = useNavigate();

  const activeLeads = leads.filter(l => !l.deletedAt);
  const activeMedicines = medicines.filter(m => !m.deletedAt && m.active);

  const [leadId, setLeadId] = useState('');
  const [packageAmount, setPackageAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [medItems, setMedItems] = useState<{ medicineId: string; quantity: number }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const medTotal = medItems.reduce((sum, item) => {
    const med = activeMedicines.find(m => m.id === item.medicineId);
    return sum + (med ? med.price * item.quantity : 0);
  }, 0);
  const pkgAmt = parseFloat(packageAmount) || 0;
  const grandTotal = pkgAmt + medTotal;
  const pending = grandTotal - (parseFloat(amountPaid) || 0);

  const addMedRow = () => setMedItems([...medItems, { medicineId: '', quantity: 1 }]);
  const removeMedRow = (i: number) => setMedItems(medItems.filter((_, idx) => idx !== i));
  const updateMedRow = (i: number, field: string, value: any) => setMedItems(medItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!leadId) e.leadId = 'Select a lead';
    if (!pkgAmt && medItems.filter(m => m.medicineId).length === 0) e.items = 'Add package amount or medicine items';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const billMedItems: BillMedicineItem[] = medItems.filter(m => m.medicineId).map(m => {
      const med = activeMedicines.find(x => x.id === m.medicineId)!;
      return { medicineId: m.medicineId, medicineName: med.name, quantity: m.quantity, unitPriceAtSale: med.price };
    });
    addBill({ leadId, enrollmentId: null, rejoinId: null, packageAmount: pkgAmt, amountPaid: parseFloat(amountPaid) || 0, medicineItems: billMedItems });
    toast.success('Bill created');
    navigate(-1);
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Create Bill" back />
      <div className="space-y-5 p-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Lead</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="mt-1.5 h-10 rounded-lg"><SelectValue placeholder="Select lead" /></SelectTrigger>
            <SelectContent>{activeLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
          {errors.leadId && <p className="mt-1 text-xs text-destructive">{errors.leadId}</p>}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Package Amount (optional)</Label>
          <Input type="number" value={packageAmount} onChange={e => setPackageAmount(e.target.value)} placeholder="0" className="mt-1.5 h-10 rounded-lg" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Amount Paid</Label>
          <Input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0" className="mt-1.5 h-10 rounded-lg" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Medicine Items</Label>
            <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={addMedRow}><Plus className="mr-1 h-3 w-3" /> Add</Button>
          </div>
          {medItems.map((item, i) => (
            <div key={i} className="mt-2 flex items-center gap-2">
              <Select value={item.medicineId} onValueChange={v => updateMedRow(i, 'medicineId', v)}>
                <SelectTrigger className="flex-1 rounded-lg text-xs h-9"><SelectValue placeholder="Medicine" /></SelectTrigger>
                <SelectContent>{activeMedicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name} · {formatCurrency(m.price)}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateMedRow(i, 'quantity', Math.max(1, item.quantity - 1))}><Minus className="h-3 w-3" /></Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateMedRow(i, 'quantity', item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeMedRow(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
          {errors.items && <p className="mt-1 text-xs text-destructive">{errors.items}</p>}
        </div>
        <Card className="border shadow-none bg-muted/30">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Package amount</span><span>{formatCurrency(pkgAmt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Medicine total</span><span>{formatCurrency(medTotal)}</span></div>
            <div className="flex justify-between font-medium"><span>Grand total</span><span>{formatCurrency(grandTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount paid</span><span>{formatCurrency(parseFloat(amountPaid) || 0)}</span></div>
            <div className={`flex justify-between font-semibold border-t pt-2 ${pending > 0 ? 'text-destructive' : 'text-status-converted'}`}>
              <span>Pending</span><span>{formatCurrency(Math.max(0, pending))}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <Button className="w-full rounded-full h-11" onClick={handleSubmit}>Create Bill</Button>
      </div>
    </div>
  );
}
