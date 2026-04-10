import { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { maskPhone, isToday, isPast } from '@/lib/helpers';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FollowUp, FollowUpOutcome, FollowUpPriority } from '@/types';
import { toast } from 'sonner';

const OUTCOMES: FollowUpOutcome[] = ['None', 'Busy', 'Not Interested', 'Callback Requested', 'Converted', 'Wrong Number', 'Disconnected'];
const NEGATIVE_OUTCOMES: FollowUpOutcome[] = ['Not Interested', 'Wrong Number', 'Disconnected'];

export default function FollowUpsList() {
  const { followUps, leads, completeFollowUp } = useCRM();
  const [selected, setSelected] = useState<FollowUp | null>(null);
  const [outcome, setOutcome] = useState<FollowUpOutcome>('None');
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState<Date | undefined>();
  const [nextPriority, setNextPriority] = useState<FollowUpPriority>('Medium');

  const items = useMemo(() => {
    return followUps
      .filter(f => !f.deletedAt && !f.completedAt && (isToday(f.followUpDate) || isPast(f.followUpDate)))
      .sort((a, b) => {
        const aO = isPast(a.followUpDate) && !isToday(a.followUpDate) ? 1 : 0;
        const bO = isPast(b.followUpDate) && !isToday(b.followUpDate) ? 1 : 0;
        if (bO !== aO) return bO - aO;
        const pm = { High: 3, Medium: 2, Low: 1 };
        if (pm[b.priority] !== pm[a.priority]) return pm[b.priority] - pm[a.priority];
        return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
      });
  }, [followUps]);

  const openSheet = (f: FollowUp) => {
    setSelected(f);
    setOutcome('None');
    setNotes('');
    setNextDate(undefined);
    setNextPriority('Medium');
  };

  const handleComplete = () => {
    if (!selected) return;
    const next = nextDate ? {
      leadId: selected.leadId,
      followUpDate: nextDate.toISOString().split('T')[0],
      priority: nextPriority,
      contactMedium: selected.contactMedium,
      notes: '',
    } : undefined;
    completeFollowUp(selected.id, outcome, notes, next);
    toast.success('Follow-up completed');
    setSelected(null);
  };

  return (
    <div>
      <div className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight">Today, {format(new Date(), 'MMM d')}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{items.length} pending follow-up{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="divide-y">
        {items.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">All caught up! 🎉</p>}
        {items.map(f => {
          const lead = leads.find(l => l.id === f.leadId);
          const overdue = isPast(f.followUpDate) && !isToday(f.followUpDate);
          return (
            <div
              key={f.id}
              className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => openSheet(f)}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${f.priority === 'High' ? 'bg-priority-high' : f.priority === 'Medium' ? 'bg-priority-medium' : 'bg-priority-low'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{lead?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{lead ? maskPhone(lead.phone) : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {overdue && <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Overdue</span>}
                <PriorityBadge priority={f.priority} />
              </div>
            </div>
          );
        })}
      </div>

      <Drawer open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Complete Follow-up</DrawerTitle>
            <DrawerDescription>{leads.find(l => l.id === selected?.leadId)?.name} · {selected?.followUpDate && new Date(selected.followUpDate).toLocaleDateString()}</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-5 px-5 pb-6">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Outcome</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {OUTCOMES.map(o => (
                  <Button
                    key={o}
                    type="button"
                    size="sm"
                    variant={outcome === o ? 'default' : 'outline'}
                    className="rounded-full text-xs h-8"
                    onClick={() => setOutcome(o)}
                  >
                    {o}
                  </Button>
                ))}
              </div>
              {NEGATIVE_OUTCOMES.includes(outcome) && (
                <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-2.5 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Lead will be marked as Lost
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 1000))}
                placeholder="Add notes..."
                className="mt-1.5 rounded-lg"
                rows={3}
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{notes.length}/1000</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Next Follow-up (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-1.5 w-full justify-start rounded-lg text-left font-normal h-10", !nextDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextDate ? format(nextDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={nextDate} onSelect={setNextDate} disabled={d => d < new Date()} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {nextDate && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                <div className="mt-2 flex gap-2">
                  {(['Low', 'Medium', 'High'] as FollowUpPriority[]).map(p => (
                    <Button
                      key={p}
                      type="button"
                      size="sm"
                      variant={nextPriority === p ? 'default' : 'outline'}
                      className="flex-1 rounded-full text-xs"
                      onClick={() => setNextPriority(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full rounded-full h-11" onClick={handleComplete}>
              Mark as Complete
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
