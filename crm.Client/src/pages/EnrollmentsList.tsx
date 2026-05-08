import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllEnrollments, useEnrollments } from '@/hooks/useEnrollments';
import { usePackages } from '@/hooks/usePackages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Filter, ArrowUpDown, AlertCircle, X } from 'lucide-react';

type EnrollmentFilter = 'All' | 'Active' | 'Expired';
type PaymentFilter = 'All' | 'Paid' | 'Pending';
type SortType = 'date-desc' | 'date-asc' | 'pending-high' | 'pending-low';

export default function EnrollmentsList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<EnrollmentFilter>('All');
  const [search, setSearch] = useState('');
  const [packageId, setPackageId] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('All');
  const [sortBy, setSortBy] = useState<SortType>('date-desc');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(null);
  
  const { deleteEnrollment } = useEnrollments();
  const { data: packages } = usePackages();

  const { data, isLoading } = useAllEnrollments({
    isActive: activeFilter === 'All' ? undefined : activeFilter === 'Active',
    search: search || undefined,
    packageId: packageId === 'All' ? undefined : packageId,
    isPending: paymentFilter === 'All' ? undefined : paymentFilter === 'Pending',
    sortBy: sortBy,
    pageSize: 50 
  });

  const enrollments = data?.items || [];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEnrollmentToDelete(id);
  };

  const confirmDelete = () => {
    if (enrollmentToDelete) {
      deleteEnrollment.mutate({ id: enrollmentToDelete });
      setEnrollmentToDelete(null);
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

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input 
                placeholder="Search patient name or phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-indigo-500"
              />
            </div>

            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="secondary" 
                  className={cn(
                    "h-12 w-12 p-0 rounded-xl bg-slate-50 border-none text-slate-500 hover:text-indigo-600 active:scale-95 transition-all",
                    (paymentFilter !== 'All' || packageId !== 'All' || sortBy !== 'date-desc') && "text-indigo-600 bg-indigo-50"
                  )}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[2.5rem] p-8 border-none h-[75vh]">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sort & Filter</SheetTitle>
                  <SheetDescription className="text-slate-400 font-medium">Refine your enrollment list</SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-8 no-scrollbar overflow-y-auto pb-24">
                  {/* Sorting */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sort By</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'date-desc', label: 'Newest First', icon: ArrowUpDown },
                        { id: 'date-asc', label: 'Oldest First', icon: ArrowUpDown },
                        { id: 'pending-high', label: 'Due: High to Low', icon: AlertCircle },
                        { id: 'pending-low', label: 'Due: Low to High', icon: AlertCircle },
                      ].map((s) => (
                        <Button
                          key={s.id}
                          variant={sortBy === s.id ? 'default' : 'secondary'}
                          className={cn(
                            "h-14 rounded-2xl font-bold transition-all text-xs justify-start px-4 gap-2",
                            sortBy === s.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          )}
                          onClick={() => setSortBy(s.id as SortType)}
                        >
                          <s.icon className="h-4 w-4" />
                          {s.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Filtering */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'All', label: 'All Payments' },
                        { id: 'Paid', label: 'Fully Paid' },
                        { id: 'Pending', label: 'Pending Dues' },
                      ].map((p) => (
                        <Button
                          key={p.id}
                          variant={paymentFilter === p.id ? 'default' : 'secondary'}
                          className={cn(
                            "h-12 px-6 rounded-2xl font-bold transition-all text-xs",
                            paymentFilter === p.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          )}
                          onClick={() => setPaymentFilter(p.id as PaymentFilter)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Package Filtering */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Package</Label>
                    <Select value={packageId} onValueChange={setPackageId}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-4 font-bold text-slate-600">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <SelectValue placeholder="All Packages" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                        <SelectItem value="All" className="font-bold">All Packages</SelectItem>
                        {packages?.map(p => (
                          <SelectItem key={p.id} value={p.id} className="font-bold">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter className="absolute bottom-8 left-8 right-8 flex-row gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-14 rounded-2xl font-bold text-slate-400"
                    onClick={() => {
                      setSortBy('date-desc');
                      setPaymentFilter('All');
                      setPackageId('All');
                      setIsFilterSheetOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-[2] h-14 rounded-2xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-100">
                      Show Results
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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

          {/* Active Filters Display */}
          {(paymentFilter !== 'All' || packageId !== 'All' || sortBy !== 'date-desc') && (
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Active:</span>
              {paymentFilter !== 'All' && (
                <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none rounded-lg px-2 py-1 flex items-center gap-1 font-bold text-[10px]">
                  {paymentFilter === 'Paid' ? 'Fully Paid' : 'Pending Dues'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPaymentFilter('All')} />
                </Badge>
              )}
              {packageId !== 'All' && (
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-2 py-1 flex items-center gap-1 font-bold text-[10px]">
                  Pkg: {packages?.find(p => p.id === packageId)?.name || 'Selected'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPackageId('All')} />
                </Badge>
              )}
              {sortBy !== 'date-desc' && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-none rounded-lg px-2 py-1 flex items-center gap-1 font-bold text-[10px]">
                  {sortBy === 'date-asc' ? 'Oldest First' : sortBy === 'pending-high' ? 'Due High to Low' : 'Due Low to High'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSortBy('date-desc')} />
                </Badge>
              )}
            </div>
          )}
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

      {/* Delete Confirmation Popup */}
      <AlertDialog open={!!enrollmentToDelete} onOpenChange={(open) => !open && setEnrollmentToDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-32px)] max-w-md rounded-2xl p-6">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Delete Enrollment?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed font-medium text-slate-500">
              This action cannot be undone. This will permanently remove the enrollment record and all associated treatment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-4">
            <AlertDialogCancel className="flex-1 rounded-xl h-11 text-xs font-bold m-0 border-slate-100 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="flex-1 rounded-xl h-11 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100 border-none"
            >
              {deleteEnrollment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
