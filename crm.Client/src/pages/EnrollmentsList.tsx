import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllEnrollments, useEnrollments } from '@/hooks/useEnrollments';
import { usePackages } from '@/hooks/usePackages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/helpers';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Package, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  Clock,
  Wallet,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EnrollmentFilter = 'All' | 'Active' | 'Expired';
type PaymentFilter = 'All' | 'Paid' | 'Pending';

export default function EnrollmentsList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<EnrollmentFilter>('All');
  const [search, setSearch] = useState('');
  const [packageId, setPackageId] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('All');
  
  const { deleteEnrollment } = useEnrollments();
  const { data: packages } = usePackages();

  const { data, isLoading } = useAllEnrollments({
    isActive: activeFilter === 'All' ? undefined : activeFilter === 'Active',
    search: search || undefined,
    packageId: packageId === 'All' ? undefined : packageId,
    isPending: paymentFilter === 'All' ? undefined : paymentFilter === 'Pending',
    pageSize: 50 
  });

  const enrollments = data?.items || [];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      deleteEnrollment.mutate(id);
    }
  };

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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enrollments</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage patient treatments</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/enrollments/new')}
            className="h-11 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>

        {/* Search & Main Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search patient name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['All', 'Active', 'Expired'] as EnrollmentFilter[]).map((f) => (
              <Button
                key={f}
                variant={activeFilter === f ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "h-9 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                  activeFilter === f ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                )}
              >
                {f}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={packageId} onValueChange={setPackageId}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="All Packages" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="All" className="text-xs font-bold">All Packages</SelectItem>
                {packages?.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-bold">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(v: PaymentFilter) => setPaymentFilter(v)}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-none text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Payment Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="All" className="text-xs font-bold">All Payments</SelectItem>
                <SelectItem value="Paid" className="text-xs font-bold text-emerald-600">Fully Paid</SelectItem>
                <SelectItem value="Pending" className="text-xs font-bold text-rose-600">Pending Dues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
              <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching Enrollments...</p>
          </div>
        ) : enrollments.length > 0 ? (
          enrollments.map((e) => (
            <div 
              key={e.id}
              onClick={() => navigate(`/enrollments/${e.id}`)}
              className="group relative flex flex-col p-5 rounded-3xl border bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              {/* Status Badge & Balance */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full flex items-center gap-1.5",
                    e.status === 'Active' ? "bg-emerald-50 text-emerald-600" : 
                    e.status === 'Scheduled' ? "bg-blue-50 text-blue-600" :
                    "bg-slate-100 text-slate-500"
                  )}>
                    {e.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span className="text-[10px] font-black uppercase tracking-wider">{e.status}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => handleDelete(event, e.id)}
                    className="h-7 w-7 rounded-full text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold tracking-tight ${e.pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {e.pendingAmount > 0 ? formatCurrency(e.pendingAmount) : 'Paid'}
                  </p>
                  {e.pendingAmount > 0 && (
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-[-2px]">Balance Due</p>
                  )}
                </div>
              </div>

              {/* Main Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate tracking-tight text-base">{e.leadName}</h3>
                    <p className="text-xs text-slate-400 font-medium">{e.leadPhone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 truncate">{e.packageName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-500">
                      {new Date(e.startDate).toLocaleDateString()} — {new Date(e.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expiry indicator line for active enrollments */}
              {e.status === 'Active' && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-50 rounded-b-3xl overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full opacity-30" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
              <Calendar className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No enrollments found</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
              {search ? `No results for "${search}".` : `No ${activeFilter.toLowerCase()} enrollments at the moment.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
