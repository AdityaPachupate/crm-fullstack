import { useParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/layout/PageHeader';
import { formatCurrency, daysBetween, todayStr } from '@/lib/helpers';
import { AlertTriangle } from 'lucide-react';

export default function EnrollmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { enrollments, leads } = useCRM();
  const enrollment = enrollments.find(e => e.id === id);

  if (!enrollment) return <div className="p-8 text-center text-muted-foreground">Enrollment not found</div>;

  const lead = leads.find(l => l.id === enrollment.leadId);
  const today = todayStr();
  const totalDays = enrollment.packageDuration;
  const elapsed = Math.max(0, Math.min(totalDays, daysBetween(enrollment.startDate, today)));
  const progress = totalDays > 0 ? (elapsed / totalDays) * 100 : 0;

  const medTotal = enrollment.medicineItems.reduce((s, m) => s + m.quantity * m.unitPriceAtSale, 0);
  const pending = enrollment.packageCost + medTotal - enrollment.amountPaid;

  return (
    <div>
      <PageHeader title={enrollment.packageName} subtitle={lead?.name} back />
      {enrollment.deletedAt && (
        <div className="flex items-center gap-2 bg-destructive/5 border-b border-destructive/20 px-5 py-2.5 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> This enrollment has been deleted
        </div>
      )}
      <div className="space-y-4 p-5">
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Day {elapsed} of {totalDays}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <Card className="border shadow-none">
          <CardContent className="p-0 divide-y">
            {[
              { label: 'Start Date', value: enrollment.startDate },
              { label: 'End Date', value: enrollment.endDate },
              { label: 'Duration', value: `${totalDays} days` },
              { label: 'Package Cost', value: formatCurrency(enrollment.packageCost) },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financial Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Package Amount', value: formatCurrency(enrollment.packageCost) },
                { label: 'Medicine Total', value: formatCurrency(medTotal) },
                { label: 'Amount Paid', value: formatCurrency(enrollment.amountPaid) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
              <div className="border-t pt-2.5 flex items-center justify-between text-sm">
                <span className="font-medium">Pending</span>
                <span className={`font-semibold ${pending > 0 ? 'text-destructive' : 'text-status-converted'}`}>{formatCurrency(Math.max(0, pending))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {enrollment.medicineItems.length > 0 && (
          <Card className="border shadow-none">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Medicine Items</h3>
              <div className="divide-y">
                {enrollment.medicineItems.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{m.medicineName} × {m.quantity}</span>
                    <span className="font-medium">{formatCurrency(m.quantity * m.unitPriceAtSale)}</span>
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
