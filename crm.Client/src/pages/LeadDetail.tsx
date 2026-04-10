import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import PageHeader from '@/components/layout/PageHeader';
import { maskPhone, relativeDate, formatCurrency, todayStr } from '@/lib/helpers';
import { Edit, CheckCircle, Pill, Phone, Globe, FileText, Calendar } from 'lucide-react';
import { LeadStatus } from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://medicalcrm-api.onrender.com').replace(/\/$/, '');
const LEADS_API_URL = `${API_BASE_URL}/api/leads`;

type FollowUpDto = {
  id: string;
  followUpDate: string;
  notes: string;
  source: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  createdAt: string;
  completedAt: string | null;
};

type BillDto = {
  id: string;
  packageAmount: number;
  advanceAmount: number;
  pendingAmount: number;
  medicineBillingAmount: number;
  createdAt: string;
};

type EnrollmentDto = {
  id: string;
  packageId: string;
  packageName: string;
  packageCostSnapshot: number;
  packageDurationSnapshot: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  bill: BillDto | null;
};

type RejoinRecordDto = {
  id: string;
  packageId: string;
  packageName: string;
  packageCostSnapshot: number;
  packageDurationSnapshot: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  bill: BillDto | null;
};

type LeadDetailResponse = {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  source: string;
  reason: string;
  createdAt: string;
  updatedAt: string | null;
  followUps: FollowUpDto[];
  enrollments: EnrollmentDto[];
  rejoinRecords: RejoinRecordDto[];
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const fetchLeadById = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${LEADS_API_URL}/${id}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Failed to load lead (${response.status})`);
        const data: LeadDetailResponse = await response.json();
        setLead(data);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message || 'Unable to fetch lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLeadById();
    return () => controller.abort();
  }, [id]);

  const leadFollowUps = useMemo(
    () => (lead?.followUps ?? []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [lead]
  );
  const leadEnrollments = lead?.enrollments ?? [];
  const leadRejoins = lead?.rejoinRecords ?? [];

  const leadBills = useMemo(
    () =>
      [...leadEnrollments, ...leadRejoins]
        .map((entry) => entry.bill)
        .filter((bill): bill is BillDto => bill !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [leadEnrollments, leadRejoins]
  );

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading lead...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!lead) return <div className="p-8 text-center text-muted-foreground">Lead not found</div>;

  const hasEnrollment = leadEnrollments.some(e => e.startDate <= todayStr() && e.endDate >= todayStr());
  const hasMedicine = leadBills.some(b => b.medicineBillingAmount > 0);
  const openOverview = () => {
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <PageHeader
        title={lead.name}
        back
        right={<Link to={`/leads/${id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Edit className="h-4 w-4" /></Button></Link>}
      />
      <div className="p-5">
        <div className="mb-5 flex items-center gap-3 flex-wrap">
          <StatusBadge status={lead.status} />
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            className="h-6 rounded-full px-2.5 text-[11px]"
            onClick={openOverview}
          >
            Overview
          </Button>
          {hasEnrollment && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-converted">
              <CheckCircle className="h-3 w-3" /> Enrolled
            </span>
          )}
          {hasMedicine && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-contacted">
              <Pill className="h-3 w-3" /> Medicine
            </span>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted h-9">
            <TabsTrigger value="followups" className="flex-1 px-1.5 text-[11px]">Followups</TabsTrigger>
            <TabsTrigger value="enrollments" className="flex-1 px-1.5 text-[11px]">Enroll</TabsTrigger>
            <TabsTrigger value="bills" className="flex-1 px-1.5 text-[11px]">Bills</TabsTrigger>
            <TabsTrigger value="rejoins" className="flex-1 px-1.5 text-[11px]">Rejoins</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5">
            <Card className="border shadow-none">
              <CardContent className="p-0 divide-y">
                {[
                  { icon: Phone, label: 'Phone', value: maskPhone(lead.phone) },
                  { icon: Globe, label: 'Source', value: lead.source },
                  { icon: FileText, label: 'Reason', value: lead.reason },
                  { icon: Calendar, label: 'Created', value: relativeDate(lead.createdAt) },
                  { icon: Calendar, label: 'Updated', value: lead.updatedAt ? relativeDate(lead.updatedAt) : 'Never' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {item.label === 'Phone' ? (
                      <a href={`tel:${lead.phone}`} className="text-sm font-medium text-primary hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium">{item.value}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followups" className="mt-5 space-y-2">
            <Link to={`/follow-ups/new/${id}`}>
              <Button variant="outline" size="sm" className="w-full rounded-full text-xs">+ Schedule Follow-up</Button>
            </Link>
            {leadFollowUps.map(f => (
              <Card key={f.id} className="border shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{new Date(f.followUpDate).toLocaleDateString()}</p>
                    <PriorityBadge priority={f.priority} />
                  </div>
                  {f.notes && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{f.notes}</p>}
                  {f.completedAt && <p className="mt-1.5 text-xs text-status-converted">✓ Completed · {f.status}</p>}
                </CardContent>
              </Card>
            ))}
            {leadFollowUps.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No follow-ups</p>}
          </TabsContent>

          <TabsContent value="enrollments" className="mt-5 space-y-2">
            {leadEnrollments.map(e => (
              <Link key={e.id} to={`/enrollments/${e.id}`}>
                <Card className="border shadow-none">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{e.packageName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{e.startDate} → {e.endDate}</p>
                    <p className="mt-1.5 text-sm font-semibold text-primary">{formatCurrency(e.packageCostSnapshot)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {leadEnrollments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No enrollments</p>}
          </TabsContent>

          <TabsContent value="bills" className="mt-5 space-y-2">
            {leadBills.map(b => {
              const pending = b.pendingAmount;
              const total = b.packageAmount + b.medicineBillingAmount;
              return (
                <Card key={b.id} className="border shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</p>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${pending <= 0 ? 'text-status-converted' : 'text-destructive'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pending <= 0 ? 'bg-status-converted' : 'bg-destructive'}`} />
                        {pending <= 0 ? 'Paid' : `${formatCurrency(pending)} due`}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium">{formatCurrency(total)}</p>
                  </CardContent>
                </Card>
              );
            })}
            {leadBills.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No bills</p>}
          </TabsContent>

          <TabsContent value="rejoins" className="mt-5 space-y-2">
            {leadRejoins.map(r => (
              <Card key={r.id} className="border shadow-none">
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{r.packageName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.startDate} → {r.endDate}</p>
                </CardContent>
              </Card>
            ))}
            {leadRejoins.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No rejoins</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
