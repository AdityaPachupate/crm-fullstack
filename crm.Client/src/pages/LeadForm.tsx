import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';
import { LeadStatus } from '@/types';
import { toast } from 'sonner';

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Consulted', 'Qualified', 'Hot', 'Warm', 'Cold', 'Lost', 'Converted'];

export default function LeadForm({ editId }: { editId?: string }) {
  const { leads, lookups, addLead, updateLead } = useCRM();
  const navigate = useNavigate();
  const existing = editId ? leads.find(l => l.id === editId) : null;

  const sources = lookups.filter(l => l.category === 'LeadSource' && !l.deletedAt);
  const reasons = lookups.filter(l => l.category === 'LeadReason' && !l.deletedAt);

  const [name, setName] = useState(existing?.name || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [status, setStatus] = useState<LeadStatus>(existing?.status || 'New');
  const [source, setSource] = useState(existing?.source || '');
  const [reason, setReason] = useState(existing?.reason || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone is required';
    if (phone.trim() && !/^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number';
    if (!source) e.source = 'Source is required';
    if (!reason) e.reason = 'Reason is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (existing) {
      updateLead(existing.id, { name: name.trim(), phone: phone.trim(), status, source, reason });
      toast.success('Lead updated');
    } else {
      addLead({ name: name.trim(), phone: phone.trim(), status, source, reason });
      toast.success('Lead created');
    }
    navigate(-1);
  };

  return (
    <div className="flex flex-col">
      <PageHeader title={existing ? 'Edit Lead' : 'New Lead'} back />
      <div className="space-y-5 p-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" className="mt-1.5 h-10 rounded-lg border-border" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Phone Number</Label>
          <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" className="mt-1.5 h-10 rounded-lg border-border" />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={v => setStatus(v as LeadStatus)}>
            <SelectTrigger className="mt-1.5 h-10 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Source</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="mt-1.5 h-10 rounded-lg"><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>{sources.map(s => <SelectItem key={s.code} value={s.code}>{s.displayName}</SelectItem>)}</SelectContent>
          </Select>
          {errors.source && <p className="mt-1 text-xs text-destructive">{errors.source}</p>}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Reason</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="mt-1.5 h-10 rounded-lg"><SelectValue placeholder="Select reason" /></SelectTrigger>
            <SelectContent>{reasons.map(r => <SelectItem key={r.code} value={r.code}>{r.displayName}</SelectItem>)}</SelectContent>
          </Select>
          {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason}</p>}
        </div>
      </div>
      <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <Button className="w-full rounded-full h-11" onClick={handleSubmit}>
          {existing ? 'Update Lead' : 'Save Lead'}
        </Button>
      </div>
    </div>
  );
}
