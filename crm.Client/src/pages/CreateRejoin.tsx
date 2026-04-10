import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PageHeader from '@/components/layout/PageHeader';
import { addDays, formatCurrency, todayStr } from '@/lib/helpers';
import { CalendarIcon, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateRejoin() {
  const { leads, packages, enrollments, addRejoin, addBill } = useCRM();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const activeLeads = leads.filter(l => !l.deletedAt);
  const activePackages = packages.filter(p => !p.deletedAt);
  const today = todayStr();

  const [leadId, setLeadId] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [packageId, setPackageId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [rejoinId, setRejoinId] = useState('');

  const selectedLead = activeLeads.find(l => l.id === leadId);
  const selectedPkg = activePackages.find(p => p.id === packageId);
  const endDateStr = startDate && selectedPkg ? addDays(startDate.toISOString().split('T')[0], selectedPkg.durationDays) : '';

  const hasActiveEnrollment = useMemo(() => {
    if (!leadId) return false;
    return enrollments.some(e => !e.deletedAt && e.leadId === leadId && e.startDate <= today && e.endDate >= today);
  }, [leadId, enrollments, today]);

  const lastEnrollment = useMemo(() => {
    if (!leadId) return null;
    const sorted = enrollments.filter(e => e.leadId === leadId && !e.deletedAt).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    return sorted[0] || null;
  }, [leadId, enrollments]);

  const filteredLeads = activeLeads.filter(l => !leadSearch || l.name.toLowerCase().includes(leadSearch.toLowerCase()));

  const handleConfirm = () => {
    if (!selectedLead || !selectedPkg || !startDate) return;
    const start = startDate.toISOString().split('T')[0];
    const end = addDays(start, selectedPkg.durationDays);
    const rejoin = addRejoin({
      leadId, packageId, packageName: selectedPkg.name, packageCost: selectedPkg.cost,
      packageDuration: selectedPkg.durationDays, startDate: start, endDate: end,
    });
    addBill({
      leadId, enrollmentId: null, rejoinId: rejoin.id,
      packageAmount: selectedPkg.cost, amountPaid: 0, medicineItems: [],
    });
    setRejoinId(rejoin.id);
    setStep(4);
    toast.success('Rejoin created');
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="New Rejoin" back />
      <div className="p-5">
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</div>
              {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search leads..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} className="pl-9 h-9 bg-muted border-0 rounded-lg text-sm" />
            </div>
            <div className="divide-y rounded-lg border">
              {filteredLeads.map(l => (
                <div key={l.id} className={`px-4 py-3 cursor-pointer transition-colors ${leadId === l.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'}`} onClick={() => setLeadId(l.id)}>
                  <p className="text-sm font-medium">{l.name}</p>
                  {lastEnrollment && l.id === leadId && <p className="text-xs text-muted-foreground">Last enrollment ended: {lastEnrollment.endDate}</p>}
                </div>
              ))}
            </div>
            <Button className="w-full rounded-full h-11" disabled={!leadId} onClick={() => setStep(2)}>Next</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {hasActiveEnrollment && (
              <div className="flex items-center gap-2 rounded-lg bg-status-contacted/5 border border-status-contacted/20 p-3 text-sm text-status-contacted">
                <AlertTriangle className="h-4 w-4 shrink-0" /> This lead has an active enrollment
              </div>
            )}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Package</Label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger className="mt-1.5 h-10 rounded-lg"><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>{activePackages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} · {p.durationDays}d · {formatCurrency(p.cost)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-1.5 w-full justify-start rounded-lg text-left font-normal h-10", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {endDateStr && <p className="mt-1 text-xs text-muted-foreground">End date: {endDateStr}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full h-11" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 rounded-full h-11" disabled={!packageId || !startDate || hasActiveEnrollment} onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Card className="border shadow-none">
              <CardContent className="p-0 divide-y">
                {[
                  { label: 'Lead', value: selectedLead?.name },
                  { label: 'Package', value: selectedPkg?.name },
                  { label: 'Duration', value: `${selectedPkg?.durationDays} days` },
                  { label: 'Start', value: startDate && format(startDate, 'PPP') },
                  { label: 'End', value: endDateStr },
                  { label: 'Cost', value: formatCurrency(selectedPkg?.cost || 0) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full h-11" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1 rounded-full h-11" onClick={handleConfirm}>Confirm Rejoin</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <Card className="border-status-converted/30 bg-status-converted/5 shadow-none">
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-status-converted" />
              <h2 className="mt-4 text-lg font-semibold">Rejoin Confirmed!</h2>
              <p className="mt-1 text-xs text-muted-foreground">ID: {rejoinId.slice(0, 8)}</p>
              <Button className="mt-5 rounded-full h-11 px-8" onClick={() => navigate('/rejoins')}>View Rejoins</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
