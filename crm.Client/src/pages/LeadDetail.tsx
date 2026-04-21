import { cn } from '@/lib/utils';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LookupBadge } from '@/components/ui/LookupBadge';
import PageHeader from '@/components/layout/PageHeader';
import { maskPhone, relativeDate, formatCurrency, todayStr } from '@/lib/helpers';
import { Edit, CheckCircle, Pill, Phone, Globe, FileText, Calendar, Trash2, CheckCircle2, Plus, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeads';
import { BillDto, FollowUpDto, EnrollmentDto, RejoinRecordDto, LeadDetail as LeadDetailType, LeadStatus } from '@/types';
import { useFollowUps } from '@/hooks/useFollowUps';
import { useEnrollments } from '@/hooks/useEnrollments';
import { CompleteFollowUpDialog } from '@/components/leads/CompleteFollowUpDialog';
import { AddEnrollmentDialog } from '@/components/leads/AddEnrollmentDialog';
import { useBills, useAddPayment } from '@/hooks/useBills';
import { BillCard } from '@/components/leads/BillCard';
import { AddPaymentDialog } from '@/components/leads/AddPaymentDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getAllStaticCodes } from '@/lib/lookup-registry';
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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading: loading, error } = useLead(id || '');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Follow-up Actions State
  const { completeFollowUp, deleteFollowUp, isCompleting, isDeleting } = useFollowUps();
  const [completingFollowUpId, setCompletingFollowUpId] = useState<string | null>(null);
  const [deletingFollowUpId, setDeletingFollowUpId] = useState<string | null>(null);

  // Enrollment Actions State
  const { deleteEnrollment } = useEnrollments();
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentDto | undefined>(undefined);
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<string | null>(null);

  // Lead Actions State
  const deleteLeadMutation = useDeleteLead();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Bills State
  const { data: billsData, isLoading: billsLoading } = useBills(id || '');
  const addPaymentMutation = useAddPayment();
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const leadFollowUps = useMemo(
    () => (lead?.followUps ?? []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [lead]
  );
  const leadEnrollments = lead?.enrollments ?? [];
  const leadRejoins = lead?.rejoinRecords ?? [];

  const leadBills = useMemo(
    () => billsData || [],
    [billsData]
  );

  const totalBalance = useMemo(
    () => leadBills.reduce((sum, b) => sum + b.pendingAmount, 0),
    [leadBills]
  );

  const nextFollowUp = useMemo(() => {
    const pending = (lead?.followUps ?? [])
      .filter(f => !f.completedAt && new Date(f.followUpDate).getTime() >= new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
    return pending[0] || null;
  }, [lead?.followUps]);

  const timelineEvents = useMemo(() => {
    const events: any[] = [];
    
    // 1. Lead Created
    if (lead) {
      events.push({
        type: 'joining',
        date: lead.createdAt,
        title: 'Patient Joined',
        description: `Added via ${lead.source}`,
        icon: Globe,
        color: 'text-blue-500'
      });
    }

    // 2. Follow-ups
    (lead?.followUps ?? []).forEach(f => {
      events.push({
        type: 'followup_created',
        date: f.createdAt,
        title: 'Follow-up Scheduled',
        description: `Set for ${new Date(f.followUpDate).toLocaleDateString()}`,
        icon: Calendar,
        color: 'text-indigo-500'
      });
      if (f.completedAt) {
        events.push({
          type: 'followup_completed',
          date: f.completedAt,
          title: 'Follow-up Completed',
          description: f.notes || 'Interaction finished',
          icon: CheckCircle2,
          color: 'text-emerald-500'
        });
      }
    });

    // 3. Enrollments (Static Events)
    leadEnrollments.forEach(e => {
      events.push({
        type: 'enrollment',
        date: e.createdAt,
        title: 'Enrolled in Package',
        description: e.packageName,
        icon: CheckCircle,
        color: 'text-status-converted'
      });
    });

    // 4. Rejoins (Static Events)
    leadRejoins.forEach(r => {
      events.push({
        type: 'rejoin',
        date: r.startDate,
        title: 'Patient Rejoined',
        description: `Restarted with ${r.packageName}`,
        icon: Plus,
        color: 'text-emerald-600'
      });
    });

    // 5. Payments (Dynamic from billsData)
    // This is the source of truth for all payments
    (billsData ?? []).forEach(bill => {
      const activePayments = (bill.payments || []).filter(p => !p.isDeleted);
      
      activePayments.forEach((p) => {
        const amount = p.amount;
        const date = p.datePaid;
        
        if (amount !== undefined) {
          events.push({
            type: 'payment',
            date: date,
            title: `₹${amount.toLocaleString()} Payment Received`,
            description: `Payment for ${bill.packageName}`,
            icon: CreditCard,
            color: 'text-emerald-500'
          });
        }
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [lead, leadEnrollments, leadRejoins, billsData]);

  const updateLeadMutation = useUpdateLead();
  const allStatuses = getAllStaticCodes('LeadStatus') as LeadStatus[];

  const handleStatusChange = (newStatus: LeadStatus) => {
    updateLeadMutation.mutate({ id: id!, lead: { status: newStatus } });
  };

  const selectedFollowUp = useMemo(() => 
    leadFollowUps.find(f => f.id === completingFollowUpId),
    [leadFollowUps, completingFollowUpId]
  );

  const selectedBill = useMemo(() => 
    (billsData ?? []).find(b => b.id === selectedBillId),
    [billsData, selectedBillId]
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

  const handleOpenAddEnrollment = () => {
    setEditingEnrollment(undefined);
    setIsEnrollmentDialogOpen(true);
  };

  const handleEditEnrollment = (enrollment: any) => {
    setEditingEnrollment(enrollment);
    setIsEnrollmentDialogOpen(true);
  };

  const handleDeleteEnrollment = async () => {
    if (!deletingEnrollmentId) return;
    try {
      await deleteEnrollment.mutateAsync(deletingEnrollmentId);
      toast.success("Enrollment deleted successfully");
      setDeletingEnrollmentId(null);
    } catch (error) {
      toast.error("Failed to delete enrollment");
    }
  };

  const handleOpenAddPayment = (billId: string) => {
    setSelectedBillId(billId);
    setIsPaymentDialogOpen(true);
  };

  const handleAddPayment = async (amount: number) => {
    if (!selectedBillId) return;
    try {
      await addPaymentMutation.mutateAsync({ billId: selectedBillId, amount });
      setIsPaymentDialogOpen(false);
      setSelectedBillId(null);
    } catch (error) {
      // toast.error is handled in hook
    }
  };


  const openOverview = () => {
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <PageHeader
        title="Patient Profile"
        back
        right={
          <div className="flex items-center gap-1">
            <Link to={`/leads/${id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      <div className="p-5">
        <Link 
          to="#" 
          onClick={(e) => { e.preventDefault(); openOverview(); }}
          className="inline-block mb-2 text-2xl font-bold tracking-tight text-slate-900 transition-colors hover:text-indigo-600"
        >
          {lead.name}
        </Link>
        <div className="mb-5 flex items-center gap-3 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="transition-transform active:scale-95 outline-none">
                <LookupBadge category="LeadStatus" code={lead.status} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 p-1">
              {allStatuses.map(s => (
                <DropdownMenuItem 
                  key={s} 
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    "rounded-lg text-xs font-medium py-2",
                    lead.status === s ? "bg-accent" : ""
                  )}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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

        {nextFollowUp && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-slate-900" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Action</p>
                <p className="text-xs font-bold text-slate-900">Follow-up: {new Date(nextFollowUp.followUpDate).toLocaleDateString()}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-[10px] font-bold text-slate-600 hover:bg-slate-200/50"
              onClick={() => setActiveTab('followups')}
            >
              View Details
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted h-9 overflow-x-auto no-scrollbar justify-start">
            <TabsTrigger value="overview" className="flex-1 min-w-[70px] px-1.5 text-[11px]">Overview</TabsTrigger>
            <TabsTrigger value="followups" className="flex-1 min-w-[70px] px-1.5 text-[11px]">Followups</TabsTrigger>
            <TabsTrigger value="enrollments" className="flex-1 min-w-[70px] px-1.5 text-[11px]">Enrollments</TabsTrigger>
            <TabsTrigger value="bills" className="flex-1 min-w-[70px] px-1.5 text-[11px]">Bills</TabsTrigger>
            <TabsTrigger value="rejoins" className="flex-1 min-w-[70px] px-1.5 text-[11px]">Rejoins</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 space-y-8">
            <Card className="border shadow-none">
              <CardContent className="p-0 divide-y">
                {[
                  { icon: Phone, label: 'Phone', value: maskPhone(lead.phone) },
                  { icon: Globe, label: 'Source', value: lead.source },
                  { icon: FileText, label: 'Reason', value: lead.reason },
                  { icon: CheckCircle2, label: 'Total Due', value: totalBalance > 0 ? formatCurrency(totalBalance) : 'Settled', isBalance: true },
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
                    ) : item.isBalance ? (
                      <span className={cn(
                        "text-sm font-bold",
                        totalBalance > 0 ? "text-destructive" : "text-emerald-600"
                      )}>
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-sm font-medium">{item.value}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6 relative pb-8">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                Interactions Timeline
              </h3>
              <div className="absolute left-[21px] top-12 bottom-6 w-0.5 bg-slate-100" />
              <div className="space-y-6">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative flex gap-4 pr-2">
                    <div className={cn(
                      "relative z-10 h-11 w-11 rounded-full flex items-center justify-center border-4 border-background shadow-sm",
                      event.color === 'text-emerald-500' ? "bg-emerald-50 text-emerald-600" :
                      event.color === 'text-blue-500' ? "bg-blue-50 text-blue-600" :
                      event.color === 'text-emerald-600' ? "bg-emerald-50 text-emerald-700" :
                      "bg-slate-50 text-indigo-600"
                    )}>
                      <event.icon size={18} />
                    </div>
                    <div className="flex-1 pt-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 tracking-widest">{relativeDate(event.date)}</span>
                      <h4 className="text-[15px] font-bold text-slate-800 leading-tight mt-0.5 truncate">{event.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 break-words line-clamp-3 group-hover:line-clamp-none transition-all">{event.description}</p>
                    </div>
                  </div>
                ))}
                {timelineEvents.length === 0 && <p className="text-center py-10 text-sm text-slate-400 font-medium">No activity yet</p>}
              </div>
            </div>
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
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-full text-xs border-dashed border-status-converted/50 text-status-converted hover:bg-status-converted/5 shadow-sm"
              onClick={handleOpenAddEnrollment}
            >
              <Plus className="mr-1 h-3 w-3" /> New Enrollment
            </Button>
            
            {leadEnrollments.map(e => (
              <Link key={e.id} to={`/enrollments/${e.id}`} className="block">
                <Card className="border shadow-none group relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer hover:border-status-converted/30 hover:bg-status-converted/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{e.packageName}</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">
                          {new Date(e.startDate).toLocaleDateString()} → {new Date(e.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={(evt) => { evt.preventDefault(); evt.stopPropagation(); handleEditEnrollment(e); }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/5"
                          onClick={(evt) => { evt.preventDefault(); evt.stopPropagation(); setDeletingEnrollmentId(e.id); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-status-converted">{formatCurrency(e.packageCostSnapshot)}</span>
                        {e.bill && (
                          <span className={cn(
                            "text-[10px] font-bold uppercase",
                            e.bill.pendingAmount <= 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {e.bill.pendingAmount <= 0 ? 'Paid' : `${formatCurrency(e.bill.pendingAmount)} Due`}
                          </span>
                        )}
                      </div>
                      {e.bill && e.bill.pendingAmount > 0 && (
                        <Button 
                          size="sm" 
                          className="h-7 px-3 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-transform active:scale-95 shadow-md shadow-indigo-100"
                          onClick={(evt) => { 
                            evt.preventDefault(); 
                            evt.stopPropagation(); 
                            handleOpenAddPayment(e.bill.id); 
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {leadEnrollments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No active enrollments</p>}
          </TabsContent>

          <TabsContent value="bills" className="mt-5 space-y-3">
            {billsLoading ? (
              <div className="py-10 text-center text-sm text-slate-400 font-medium">Loading bills...</div>
            ) : (
              <>
                {(billsData ?? []).map(b => (
                  <BillCard 
                    key={b.id} 
                    bill={b} 
                    onAddPayment={handleOpenAddPayment} 
                    patientName={lead.name}
                  />
                ))}
                {(billsData ?? []).length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No bills found for this patient</p>
                )}
              </>
            )}
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

      {/* Enrollment Modals */}
      <AddEnrollmentDialog
        isOpen={isEnrollmentDialogOpen}
        onClose={() => {
          setIsEnrollmentDialogOpen(false);
          setEditingEnrollment(undefined);
        }}
        leadId={id!}
        enrollment={editingEnrollment}
      />

      <AlertDialog open={!!deletingEnrollmentId} onOpenChange={(open) => !open && setDeletingEnrollmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Enrollment to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the enrollment record and linked billing Information to Trash. You can restore them later from the Trash section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEnrollment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Patient to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move <strong>{lead.name}</strong> and all related records to the trash. You can restore them later from the Trash section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await deleteLeadMutation.mutateAsync(id!);
                navigate('/leads');
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLeadMutation.isPending ? 'Moving to Trash...' : 'Move to Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onConfirm={handleAddPayment}
        isSubmitting={addPaymentMutation.isPending}
        billId={selectedBillId}
        pendingAmount={selectedBill?.pendingAmount || 0}
        packageName={selectedBill?.packageName}
      />
    </div>
  );
}
