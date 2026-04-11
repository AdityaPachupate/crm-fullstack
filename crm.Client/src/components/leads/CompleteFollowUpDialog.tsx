import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FollowUpOutcome, LeadStatus, FollowUpPriority } from '@/types';
import { ALL_STATUSES } from '@/constants';
import { Input } from '@/components/ui/input';

import { getAllStaticCodes, getStaticLookup } from '@/lib/lookup-registry';

interface CompleteFollowUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    outcome: FollowUpOutcome;
    notes: string;
    newLeadStatus?: LeadStatus;
    nextFollowUpDate?: string;
    nextFollowUpPriority?: FollowUpPriority;
  }) => void;
  isSubmitting?: boolean;
}

const OUTCOMES = getAllStaticCodes('FollowUpOutcome') as FollowUpOutcome[];

export function CompleteFollowUpDialog({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: CompleteFollowUpDialogProps) {
  const [outcome, setOutcome] = useState<FollowUpOutcome>('None');
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<LeadStatus | 'NoChange'>('NoChange');
  const [nextDate, setNextDate] = useState('');
  const [nextPriority, setNextPriority] = useState<FollowUpPriority>('Medium');

  const handleSubmit = () => {
    onConfirm({
      outcome,
      notes,
      newLeadStatus: newStatus === 'NoChange' ? undefined : newStatus,
      nextFollowUpDate: nextDate || undefined,
      nextFollowUpPriority: nextDate ? nextPriority : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Follow-up</DialogTitle>
          <DialogDescription>
            Record the outcome of your conversation and plan next steps.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as FollowUpOutcome)}>
              <SelectTrigger id="outcome">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {getStaticLookup('FollowUpOutcome', o).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="What was discussed?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Update Patient Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NoChange">No Change</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <Label className="text-xs text-muted-foreground uppercase font-semibold">Schedule Next (Optional)</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="grid gap-2">
                <Label htmlFor="nextDate" className="text-[11px]">Next Date</Label>
                <Input
                  id="nextDate"
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nextPriority" className="text-[11px]">Next Priority</Label>
                <Select value={nextPriority} onValueChange={(v) => setNextPriority(v as FollowUpPriority)}>
                  <SelectTrigger id="nextPriority" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Complete Follow-up'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
