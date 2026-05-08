import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { 
  Plus, 
  Search, 
  Receipt, 
  ArrowLeft, 
  Loader2,
  Wallet,
  Calendar,
  User,
  ArrowUpRight,
  Filter,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BillFilter = 'All' | 'Paid' | 'Pending';

export default function BillsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillFilter>('All');
  
  const { data, isLoading } = useBills();
  const bills = data?.items || [];

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.leadName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' 
      ? true 
      : statusFilter === 'Paid' 
        ? bill.pendingAmount <= 0 
        : bill.pendingAmount > 0;
    return matchesSearch && matchesStatus && !bill.isDeleted;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header Area */}
      <div className="bg-white px-6 pt-8 pb-6 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Bills</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage payments & invoices</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/bills/new')}
            className="h-11 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Bill
          </Button>
        </div>

        {/* Search & Main Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search patient name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-indigo-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['All', 'Pending', 'Paid'] as BillFilter[]).map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "h-9 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                  statusFilter === f ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">No bills found</p>
              <p className="text-xs text-slate-400 font-medium max-w-[200px] mt-1">Try adjusting your filters or search terms.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => { setSearch(''); setStatusFilter('All'); }}
              className="mt-2 rounded-xl text-xs font-bold"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredBills.map((bill) => (
            <Card 
              key={bill.id} 
              className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/leads/${bill.leadId}`)}
            >
              <CardContent className="p-0">
                <div className="p-5 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                      bill.pendingAmount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        {bill.leadName}
                        <ArrowUpRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(bill.createdAt)}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-tighter">
                          ID: {bill.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">
                      {formatCurrency(bill.initialAmount + (bill.medicineBillingAmount || 0))}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/50 px-5 py-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Paid</p>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-black text-emerald-600">{formatCurrency(bill.amountPaid)}</span>
                    </div>
                  </div>
                  <div className="text-right border-l border-slate-100 pl-4">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Pending</p>
                    <div className="flex items-center justify-end gap-2">
                      <span className={cn(
                        "text-sm font-black",
                        bill.pendingAmount > 0 ? "text-rose-500" : "text-emerald-500"
                      )}>
                        {formatCurrency(bill.pendingAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
