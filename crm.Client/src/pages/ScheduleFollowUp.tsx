import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PageHeader from '@/components/layout/PageHeader';
import { FollowUpPriority } from '@/types';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLead } from '@/hooks/useLeads';
import { useCreateFollowUp } from '@/hooks/useFollowUps';

export default function ScheduleFollowUp() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  
  const { data: lead, isLoading: loadingLead } = useLead(leadId || '');
  const createMutation = useCreateFollowUp();

  const [date, setDate] = useState<Date | undefined>();
  const [contactMedium, setContactMedium] = useState('');
  const [priority, setPriority] = useState<FollowUpPriority>('Medium');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = 'Date is required';
    if (!contactMedium.trim()) e.contactMedium = 'Contact method is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !leadId) return;
    
    await createMutation.mutateAsync({
      leadId,
      followUpDate: format(date!, 'yyyy-MM-dd'),
      source: contactMedium.trim(), // API calls it 'Source'
      priority,
      notes: notes.trim(),
    });

    navigate(-1);
  };

  if (leadId && loadingLead) return <div className="p-8 text-center text-muted-foreground">Loading lead...</div>;
  if (!lead) return <div className="p-8 text-center text-muted-foreground">Lead not found</div>;

  return (
    <div className="flex flex-col">
      <PageHeader title="New Follow-up" subtitle={lead.name} back />
      <div className="space-y-5 p-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Follow-up Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("mt-1.5 w-full justify-start rounded-lg text-left font-normal h-10", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} disabled={d => d < new Date(new Date().setHours(0,0,0,0))} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">How will you contact them?</Label>
          <Input value={contactMedium} onChange={e => setContactMedium(e.target.value)} placeholder="Phone call, WhatsApp, etc." className="mt-1.5 h-10 rounded-lg" />
          {errors.contactMedium && <p className="mt-1 text-xs text-destructive">{errors.contactMedium}</p>}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
          <div className="mt-2 flex gap-2">
            {(['Low', 'Medium', 'High'] as FollowUpPriority[]).map(p => (
              <Button key={p} type="button" size="sm" variant={priority === p ? 'default' : 'outline'} className="flex-1 rounded-full text-xs" onClick={() => setPriority(p)}>{p}</Button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Notes (optional)</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes..." className="mt-1.5 rounded-lg" rows={3} />
        </div>
      </div>
      <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <Button 
          className="w-full rounded-full h-11" 
          onClick={handleSubmit} 
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Scheduling...' : 'Schedule'}
        </Button>
      </div>
    </div>
  );
}
