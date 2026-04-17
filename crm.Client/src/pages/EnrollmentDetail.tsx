import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency, daysBetween, todayStr } from '@/lib/helpers';
import { AlertTriangle, Calendar, CreditCard, Pill, User } from 'lucide-react';
import { useEnrollment } from '@/hooks/useEnrollments';

export default function EnrollmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: enrollment, isLoading, error } = useEnrollment(id || '');

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading enrollment details...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{(error as Error).message}</div>;
  if (!enrollment) return <div className="p-8 text-center text-muted-foreground">Enrollment not found</div>;

  const today = todayStr();
  const totalDays = enrollment.packageDurationSnapshot;
  const elapsed = Math.max(0, Math.min(totalDays, daysBetween(enrollment.startDate, today)));
  const progress = totalDays > 0 ? (elapsed / totalDays) * 100 : 0;

  return (
    <div>
      <PageHeader 
        title={enrollment.packageName} 
        subtitle={`Patient: ${enrollment.leadName}`} 
        back 
      />
      
      {enrollment.isDeleted && (
        <div className="flex items-center gap-2 bg-destructive/5 border-b border-destructive/20 px-5 py-2.5 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> This enrollment has been deleted
        </div>
      )}

      <div className="space-y-6 p-5">
        {/* Progress Section */}
        <Card className="border shadow-none bg-slate-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Treatment Progress</span>
              <span className="text-xs font-bold text-slate-900">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Day {elapsed}</span>
              <span>{totalDays} Days Total</span>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border shadow-none">
            <CardContent className="p-0 divide-y">
              {[
                { icon: User, label: 'Patient', value: enrollment.leadName },
                { icon: Calendar, label: 'Start Date', value: new Date(enrollment.startDate).toLocaleDateString() },
                { icon: Calendar, label: 'End Date', value: new Date(enrollment.endDate).toLocaleDateString() },
                { icon: CreditCard, label: 'Package Cost', value: formatCurrency(enrollment.packageCostSnapshot) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="border shadow-none">
          <CardContent className="p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              Financial Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Package Amount', value: formatCurrency(enrollment.initialAmount) },
                { label: 'Medicine Total', value: formatCurrency(enrollment.medicineBillingAmount) },
                { label: 'Total Billed', value: formatCurrency(enrollment.initialAmount + enrollment.medicineBillingAmount), isTotal: true },
                { label: 'Amount Paid', value: formatCurrency(enrollment.amountPaid), isPaid: true },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between text-sm ${item.isTotal ? 'pt-2 border-t font-bold' : ''}`}>
                  <span className={item.isTotal ? 'text-slate-900' : 'text-muted-foreground'}>{item.label}</span>
                  <span className={item.isPaid ? 'text-emerald-600 font-bold' : ''}>{item.value}</span>
                </div>
              ))}
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Balance Pending</span>
                <span className={`text-base font-black ${enrollment.pendingAmount > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                  {formatCurrency(enrollment.pendingAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medicine Items */}
        {enrollment.medicineItems && enrollment.medicineItems.length > 0 && (
          <Card className="border shadow-none">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Pill className="h-4 w-4 text-indigo-500" />
                Medicine Details
              </h3>
              <div className="space-y-3">
                {enrollment.medicineItems.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{m.medicineName}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase uppercase tracking-widest">
                        {m.quantity} Units × {formatCurrency(m.unitPriceAtSale)}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {formatCurrency(m.quantity * m.unitPriceAtSale)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
