import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/helpers';
import { CreditCard, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  isSubmitting: boolean;
  billId: string | null;
  pendingAmount: number;
  packageName?: string;
}

export function AddPaymentDialog({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  billId,
  pendingAmount,
  packageName,
}: AddPaymentDialogProps) {
  const [amount, setAmount] = useState<string>('');
  
  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    onConfirm(numAmount);
  };

  const remaining = pendingAmount - (parseFloat(amount) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-32px)] max-w-md border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl">
        <DialogHeader className="p-6 pb-2 text-left">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 ring-4 ring-indigo-50/50">
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Record Payment</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-xs">
            Recording payment for: <span className="text-indigo-600 font-bold">{packageName || 'this bill'}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current Balance</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 shrink-0 mx-2">
                <ArrowRight size={14} />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remaining</p>
                <p className={cn(
                  "text-base font-bold",
                  remaining < 0 ? "text-amber-600" : remaining === 0 ? "text-emerald-600" : "text-slate-900"
                )}>
                  {formatCurrency(Math.max(0, remaining))}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {(parseFloat(amount) || 0) > pendingAmount && (
                <p className="text-[9px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  Note: Amount exceeds balance.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 rounded-xl font-bold h-11 text-slate-500 m-0"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg shadow-indigo-200 m-0"
            >
              {isSubmitting ? '...' : 'Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
