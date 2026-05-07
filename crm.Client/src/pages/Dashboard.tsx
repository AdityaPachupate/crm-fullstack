import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  CalendarCheck, 
  PhoneCall, 
  DollarSign, 
  ChevronRight, 
  Loader2, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  UserPlus,
  Package,
  Pill,
  Receipt,
  RefreshCw,
  Plus,
  Settings2,
  X
} from 'lucide-react';
import { formatCurrency, isToday, isPast, todayStr, formatDate } from '@/lib/helpers';
import { useLeads } from '@/hooks/useLeads';
import { useBills } from '@/hooks/useBills';
import { useFollowUpsToday } from '@/hooks/useFollowUps';
import { useAllEnrollments } from '@/hooks/useEnrollments';
import { getStaticLookup } from '@/lib/lookup-registry';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const ALL_WIDGETS = [
  { id: 'packages', label: 'Packages', to: '/packages', icon: Package, color: 'text-blue-500' },
  { id: 'medicines', label: 'Medicines', to: '/medicines', icon: Pill, color: 'text-emerald-500' },
  { id: 'enrollments', label: 'Enrollments', to: '/enrollments', icon: Receipt, color: 'text-purple-500' },
  { id: 'bill', label: 'Create Bill', to: '/bills/new', icon: Plus, color: 'text-orange-500' },
  { id: 'rejoins', label: 'Rejoins', to: '/rejoins', icon: RefreshCw, color: 'text-pink-500' },
];

export default function Dashboard() {
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: billsData, isLoading: billsLoading } = useBills();
  const { data: followUpsData, isLoading: followUpsLoading } = useFollowUpsToday();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useAllEnrollments();

  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : ALL_WIDGETS.map(w => w.id);
  });

  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(enabledWidgets));
  }, [enabledWidgets]);

  const leads = leadsData?.items || [];
  const bills = billsData?.items || [];
  const followUps = followUpsData || [];
  const enrollments = enrollmentsData?.items || [];

  const activeLeads = leads.filter(l => !l.deletedAt);
  const activeEnrollments = enrollments.filter(e => !e.deletedAt && e.startDate <= todayStr() && e.endDate >= todayStr());

  const todayFollowUps = useMemo(() => {
    return followUps
      .filter(f => !f.completedAt && (isToday(f.followUpDate) || isPast(f.followUpDate)))
      .sort((a, b) => {
        const aOverdue = isPast(a.followUpDate) && !isToday(a.followUpDate) ? 1 : 0;
        const bOverdue = isPast(b.followUpDate) && !isToday(b.followUpDate) ? 1 : 0;
        if (bOverdue !== aOverdue) return bOverdue - aOverdue;
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority as keyof typeof pMap] - pMap[a.priority as keyof typeof pMap];
      });
  }, [followUps]);

  const recentLeads = useMemo(() => {
    return [...activeLeads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activeLeads]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    activeLeads.forEach(l => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activeLeads]);

  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    activeLeads.forEach(l => {
      counts[l.source || 'Unknown'] = (counts[l.source || 'Unknown'] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [activeLeads]);

  const overdueCount = todayFollowUps.filter(f => isPast(f.followUpDate) && !isToday(f.followUpDate)).length;

  const pendingBilling = useMemo(() => {
    return bills.reduce((sum, b) => sum + b.pendingAmount, 0);
  }, [bills]);

  const isLoading = leadsLoading || billsLoading || followUpsLoading || enrollmentsLoading;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const currentDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const statusColors: Record<string, string> = {
    "New": "hsl(var(--status-new))",
    "Contacted": "hsl(var(--status-contacted))",
    "Consulted": "hsl(var(--status-consulted))",
    "Qualified": "hsl(var(--status-qualified))",
    "Hot": "hsl(var(--status-hot))",
    "Warm": "hsl(var(--status-warm))",
    "Cold": "hsl(var(--status-cold))",
    "Lost": "hsl(var(--status-lost))",
    "Converted": "hsl(var(--status-converted))",
  };

  const chartConfig = {
    value: { label: "Count" },
    ...Object.fromEntries(
      Object.entries(statusColors).map(([status, color]) => [status, { label: status, color }])
    )
  };

  const toggleWidget = (id: string) => {
    setEnabledWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen p-6 space-y-6 pb-24 relative bg-background/50">
      <div className="absolute inset-0 z-[-1] opacity-[0.4] pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
             backgroundSize: '24px 24px' 
           }} 
      />
      
      <div className="rounded-2xl bg-primary px-8 py-8 text-primary-foreground shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{greeting}, Admin!</h1>
        <p className="mt-2 text-primary-foreground/80 font-medium">Today is {currentDate}.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
        {[
          { label: 'Total Patients', value: activeLeads.length, color: 'text-blue-600', trend: '+12% month' },
          { label: 'Active Enrollments', value: activeEnrollments.length, color: 'text-emerald-600', trend: '8 active' },
          { label: "Today's Tasks", value: todayFollowUps.length, color: 'text-amber-600', badge: overdueCount, trend: `${overdueCount} overdue` },
          { label: 'Pending Billing', value: formatCurrency(Math.max(0, pendingBilling)), color: 'text-purple-600', trend: 'Action req.' },
        ].map((m, i) => (
          <Card key={i} className="border-none shadow-sm col-span-1">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</p>
                <p className={`text-xl font-bold tracking-tight mt-1 ${m.color}`}>{m.value}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {m.trend}
                </p>
                {m.badge ? (
                  <Badge variant="destructive" className="rounded-full h-4 px-1 py-0 text-[8px] font-bold">{m.badge}</Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Priority Tasks (Moved Above Charts) */}
        <Card className="col-span-2 md:col-span-4 border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Priority Tasks</CardTitle>
              <CardDescription className="text-xs">Immediate follow-ups</CardDescription>
            </div>
            <Link to="/follow-ups" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[250px]">
            <div className="divide-y divide-border/50">
              {todayFollowUps.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground font-medium italic">All caught up! 🎉</div>
              ) : (
                todayFollowUps.slice(0, 5).map(f => {
                  const lead = activeLeads.find(l => l.id === f.leadId);
                  const overdue = isPast(f.followUpDate) && !isToday(f.followUpDate);
                  const priorityMeta = getStaticLookup('FollowUpPriority', f.priority);
                  return (
                    <Link key={f.id} to="/follow-ups" className="block transition-colors hover:bg-muted/30">
                      <div className="flex items-center gap-4 px-5 py-3">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${priorityMeta.bgColor} shadow-sm`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{lead?.name || 'Unknown'}</p>
                          <p className={`text-[10px] ${overdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                            {overdue ? 'Overdue' : 'Due today'} • {f.notes || 'No notes'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card className="col-span-2 border-none shadow-sm flex flex-col min-h-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Lead Status</CardTitle>
            <CardDescription className="text-xs">Pipeline overview</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-0 overflow-hidden flex flex-col">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-square max-h-[200px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" nameKey="name">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.name] || `hsl(var(--primary))`} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pb-4 px-2">
              {statusDistribution.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[s.name] || 'hsl(var(--primary))' }} />
                  <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Sources */}
        <Card className="col-span-2 border-none shadow-sm flex flex-col min-h-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Top Sources</CardTitle>
            <CardDescription className="text-xs">Patient channels</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-0 overflow-hidden">
            <ChartContainer config={{ value: { label: "Leads", color: "hsl(var(--primary))" } }} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceDistribution} layout="vertical" margin={{ left: -30, right: 10, top: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 500 }} width={90} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Section (Bottom Minimal Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Access</h3>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-[10px] font-semibold text-primary flex items-center gap-1 hover:underline">
                <Settings2 className="h-3 w-3" /> Manage
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Customize Dashboard Widgets</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {ALL_WIDGETS.map(w => (
                  <div key={w.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={w.id} 
                      checked={enabledWidgets.includes(w.id)} 
                      onCheckedChange={() => toggleWidget(w.id)}
                    />
                    <label htmlFor={w.id} className="text-sm font-medium leading-none flex items-center gap-2">
                      <w.icon className={`h-4 w-4 ${w.color}`} />
                      {w.label}
                    </label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {ALL_WIDGETS.filter(w => enabledWidgets.includes(w.id)).map(w => (
            <Link key={w.id} to={w.to}>
              <Card className="border-none shadow-sm hover:bg-muted/50 transition-colors group">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                  <div className={`h-10 w-10 rounded-full bg-background shadow-inner flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <w.icon className={`h-5 w-5 ${w.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-center">{w.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      {isLoading && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-sm border">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          Updating...
        </div>
      )}
    </div>
  );
}


