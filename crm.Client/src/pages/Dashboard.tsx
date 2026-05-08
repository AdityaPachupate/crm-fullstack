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
import { useDashboardStats } from '@/hooks/useDashboardStats';
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
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : ALL_WIDGETS.map(w => w.id);
  });

  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(enabledWidgets));
  }, [enabledWidgets]);

  const statusDistribution = stats?.statusDistribution || [];
  const sourceDistribution = stats?.sourceDistribution || [];
  const priorityTasks = stats?.priorityTasks || [];

  const isLoading = statsLoading;

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
          { label: 'Total Patients', value: stats?.totalPatients || 0, color: 'text-blue-600', trend: stats?.patientsTrend || 'Loading...' },
          { label: 'Active Enrollments', value: stats?.activeEnrollments || 0, color: 'text-emerald-600', trend: stats?.enrollmentsTrend || 'Loading...' },
          { label: "Today's Tasks", value: stats?.todayTasks || 0, color: 'text-amber-600', badge: stats?.overdueTasks || 0, trend: stats?.tasksTrend || 'Loading...' },
          { label: 'Pending Billing', value: formatCurrency(stats?.pendingBilling || 0), color: 'text-purple-600', trend: stats?.billingTrend || 'Loading...' },
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
              {priorityTasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground font-medium italic">All caught up! 🎉</div>
              ) : (
                priorityTasks.map(f => {
                  const priorityMeta = {
                    bgColor: f.priority === 'High' ? 'bg-red-500' : f.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                  };
                  return (
                    <Link key={f.id} to="/follow-ups" className="block transition-colors hover:bg-muted/30">
                      <div className="flex items-center gap-4 px-5 py-3">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${priorityMeta.bgColor} shadow-sm`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{f.leadName}</p>
                          <p className={`text-[10px] ${f.isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                            {f.isOverdue ? 'Overdue' : 'Due today'} • {f.notes || 'No notes'}
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
            <DialogContent className="w-[calc(100%-32px)] max-w-md rounded-2xl p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">Customize Dashboard</DialogTitle>
                <p className="text-xs text-muted-foreground">Select widgets to show on your home screen</p>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {ALL_WIDGETS.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-colors">
                    <label htmlFor={w.id} className="text-sm font-semibold flex items-center gap-3 cursor-pointer flex-1">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                        <w.icon className={`h-4 w-4 ${w.color}`} />
                      </div>
                      {w.label}
                    </label>
                    <Checkbox 
                      id={w.id} 
                      checked={enabledWidgets.includes(w.id)} 
                      onCheckedChange={() => toggleWidget(w.id)}
                      className="rounded-md"
                    />
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


