import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';
import { LeadStatus } from '@/types';
import { toast } from 'sonner';
import { useCreateLead, useLead, useUpdateLead } from '@/hooks/useLeads';
import { useLookupRegistry } from '@/hooks/useLookupRegistry';
import { getAllStaticCodes } from '@/lib/lookup-registry';

import { LOOKUP_CATEGORIES } from '@/constants';

export default function LeadForm({ editId }: { editId?: string }) {
  const navigate = useNavigate();
  const { data: existingLead, isLoading: loadingLead } = useLead(editId || '');
  const { dynamicLookups, getLookupMetadata } = useLookupRegistry();
  
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();

  const statuses = getAllStaticCodes('LeadStatus') as LeadStatus[];
  const sources = dynamicLookups.filter(l => l.category === LOOKUP_CATEGORIES.LEAD_SOURCE && !l.deletedAt);
  const reasons = dynamicLookups.filter(l => l.category === LOOKUP_CATEGORIES.LEAD_REASON && !l.deletedAt);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [source, setSource] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingLead) {
      setName(existingLead.name);
      setPhone(existingLead.phone);
      setStatus(existingLead.status);
      setSource(existingLead.source);
      setReason(existingLead.reason);
    }
  }, [existingLead]);

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

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!validate()) return;
    
    const leadData = { name: name.trim(), phone: phone.trim(), status, source, reason };

    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, lead: leadData });
        navigate(-1);
      } else {
        await createMutation.mutateAsync(leadData);
        navigate(-1);
      }
    } catch (err) {
      // Mutation hooks handle error notifications via toast
    }
  };

  if (editId && loadingLead) return <div className="p-8 text-center text-muted-foreground">Loading patient...</div>;

  return (
    <div className="flex flex-col">
      <PageHeader title={editId ? 'Edit Patient' : 'New Patient'} back />
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
            <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
        <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : (editId ? 'Update Patient' : 'Save Patient')}
        </Button>
      </div>
    </div>
  );
}
