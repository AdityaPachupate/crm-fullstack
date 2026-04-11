import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CalendarCheck, PhoneCall, DollarSign, ChevronRight } from 'lucide-react';
import { formatCurrency, isToday, isPast, todayStr } from '@/lib/helpers';

import { getStaticLookup } from '@/lib/lookup-registry';

export default function Dashboard() {
  const { leads, enrollments, followUps, bills } = useCRM();

  const activeLeads = leads.filter(l => !l.deletedAt);
  const activeEnrollments = enrollments.filter(e => !e.deletedAt && e.startDate <= todayStr() && e.endDate >= todayStr());

  const todayFollowUps = useMemo(() => {
    return followUps
      .filter(f => !f.deletedAt && !f.completedAt && (isToday(f.followUpDate) || isPast(f.followUpDate)))
      .sort((a, b) => {
        const aOverdue = isPast(a.followUpDate) && !isToday(a.followUpDate) ? 1 : 0;
        const bOverdue = isPast(b.followUpDate) && !isToday(b.followUpDate) ? 1 : 0;
        if (bOverdue !== aOverdue) return bOverdue - aOverdue;
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      });
  }, [followUps]);

  const overdueCount = todayFollowUps.filter(f => isPast(f.followUpDate) && !isToday(f.followUpDate)).length;

  const pendingBilling = useMemo(() => {
    return bills.filter(b => !b.deletedAt).reduce((sum, b) => {
      const medTotal = b.medicineItems.reduce((s, m) => s + m.quantity * m.unitPriceAtSale, 0);
      return sum + (b.packageAmount + medTotal - b.amountPaid);
    }, 0);
  }, [bills]);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-5 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{greeting} !</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's your clinic hub for today, <span className="text-foreground font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Patients', value: activeLeads.length, icon: Users },
          { label: 'Active Enrollments', value: activeEnrollments.length, icon: CalendarCheck },
          { label: "Today's Follow-ups", value: todayFollowUps.length, icon: PhoneCall, badge: overdueCount },
          { label: 'Pending Billing', value: formatCurrency(Math.max(0, pendingBilling)), icon: DollarSign },
        ].map(m => (
          <Card key={m.label} className="border shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <m.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                {m.badge ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">{m.badge}</span>
                ) : null}
              </div>
              <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Today's Tasks</h2>
          <Link to="/follow-ups" className="text-xs font-medium text-primary hover:underline">View all</Link>
        </div>
        {todayFollowUps.length === 0 ? (
          <Card className="border shadow-none">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">No follow-ups for today 🎉</CardContent>
          </Card>
        ) : (
          <Card className="border shadow-none divide-y">
            {todayFollowUps.slice(0, 5).map(f => {
              const lead = activeLeads.find(l => l.id === f.leadId);
              const overdue = isPast(f.followUpDate) && !isToday(f.followUpDate);
              const priorityMeta = getStaticLookup('FollowUpPriority', f.priority);
              
              return (
                <Link key={f.id} to="/follow-ups" className="block">
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${priorityMeta.bgColor}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{lead?.name || 'Unknown'}</p>
                      {overdue && <span className="text-[10px] font-medium text-destructive">Overdue</span>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
