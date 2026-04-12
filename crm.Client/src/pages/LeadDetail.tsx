import { cn } from '@/lib/utils';
import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LookupBadge } from '@/components/ui/LookupBadge';
import PageHeader from '@/components/layout/PageHeader';
import { maskPhone, relativeDate, formatCurrency, todayStr } from '@/lib/helpers';
import { Edit, CheckCircle, Pill, Phone, Globe, FileText, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { useLead } from '@/hooks/useLeads';
import { BillDto, FollowUpDto, EnrollmentDto, RejoinRecordDto, LeadDetail as LeadDetailType } from '@/types';
import { useFollowUps } from '@/hooks/useFollowUps';
import { CompleteFollowUpDialog } from '@/components/leads/CompleteFollowUpDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';



export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading: loading, error } = useLead(id || '');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Follow-up Actions State
  const { completeFollowUp, deleteFollowUp, isCompleting, isDeleting } = useFollowUps();
  const [completingFollowUpId, setCompletingFollowUpId] = useState<string | null>(null);
  const [deletingFollowUpId, setDeletingFollowUpId] = useState<string | null>(null);

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

  const selectedFollowUp = useMemo(() => 
    leadFollowUps.find(f => f.id === completingFollowUpId),
    [leadFollowUps, completingFollowUpId]
  );

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading patient...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{(error as Error).message}</div>;
  if (!lead) return <div className="p-8 text-center text-muted-foreground">Patient not found</div>;

  const hasEnrollment = leadEnrollments.some(e => e.startDate <= todayStr() && e.endDate >= todayStr());
  const hasMedicine = leadBills.some(b => b.medicineBillingAmount > 0);
  
  const handleComplete = (data: any) => {
    if (!completingFollowUpId) return;
    completeFollowUp.mutate({ id: completingFollowUpId, request: { followUpId: completingFollowUpId, ...data } }, {
      onSuccess: () => setCompletingFollowUpId(null)
    });
  };

  const handleDelete = () => {
    if (!deletingFollowUpId) return;
    deleteFollowUp.mutate(deletingFollowUpId, {
      onSuccess: () => setDeletingFollowUpId(null)
    });
  };

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
          <LookupBadge category="LeadStatus" code={lead.status} />
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
              <Card key={f.id} className="border shadow-none relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-indigo-600">Scheduled: {new Date(f.followUpDate).toLocaleDateString()}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Created: {new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <LookupBadge category="FollowUpPriority" code={f.priority} />
                    </div>
                  </div>
                  
                  {f.notes && <p className="mt-1.5 whitespace-pre-line break-words text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded">{f.notes}</p>}
                  
                  <div className="mt-3 pt-2 border-t flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      f.status === 'Pending' ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {f.status}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {!f.completedAt ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 border-emerald-100 bg-emerald-50/30"
                          onClick={() => setCompletingFollowUpId(f.id)}
                        >
                          <CheckCircle2 size={12} className="mr-1" /> Mark Complete
                        </Button>
                      ) : (
                        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={12} /> Completed {new Date(f.completedAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:bg-destructive/5 rounded-full"
                        onClick={() => setDeletingFollowUpId(f.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
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

      {/* Action Modals */}
      <CompleteFollowUpDialog
        isOpen={!!completingFollowUpId}
        onClose={() => setCompletingFollowUpId(null)}
        onConfirm={handleComplete}
        isSubmitting={isCompleting}
        initialNotes={selectedFollowUp?.notes}
      />

      <AlertDialog open={!!deletingFollowUpId} onOpenChange={(open) => !open && setDeletingFollowUpId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the follow-up record to Trash. It can be restored later but will no longer appear in the active schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Move to Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
