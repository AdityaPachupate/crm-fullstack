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
      <DialogContent className="sm:max-w-[400px] border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-md">
        <DialogHeader className="p-6 pb-2">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50">
            <CreditCard className="h-6 w-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">Record Payment</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Recording payment for: <span className="text-indigo-600 font-bold">{packageName || 'this bill'}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Balance</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300">
                <ArrowRight size={16} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projected</p>
                <p className={cn(
                  "text-lg font-bold",
                  remaining < 0 ? "text-amber-600" : remaining === 0 ? "text-emerald-600" : "text-slate-900"
                )}>
                  {formatCurrency(Math.max(0, remaining))}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Amount (₹)</Label>
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
                <p className="text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 animate-in fade-in slide-in-from-top-1">
                  Note: Amount exceeds balance. Excess will show as a credit.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 rounded-xl font-bold h-11 text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:scale-100 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
