// ─── Shared ───
export type SoftDeletable = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

// ─── Lead ───
export type LeadStatus =
  | 'New' | 'Contacted' | 'Consulted' | 'Qualified'
  | 'Hot' | 'Warm' | 'Cold' | 'Lost' | 'Converted';

export interface Lead extends SoftDeletable {
  name: string;
  phone: string;
  status: LeadStatus;
  source: string;
  reason: string;
  hasEnrollment?: boolean;
  hasMedicine?: boolean;
}

// ─── Follow-up ───
export type FollowUpPriority = 'Low' | 'Medium' | 'High';
export type FollowUpOutcome =
  | 'None' | 'Busy' | 'NotInterested' | 'CallbackRequested'
  | 'Converted' | 'WrongNumber' | 'Disconnected';

export interface FollowUp extends SoftDeletable {
  leadId: string;
  followUpDate: string;
  contactMedium: string;
  priority: FollowUpPriority;
  notes: string;
  completedAt: string | null;
  outcome: FollowUpOutcome | null;
  outcomeNotes: string;
}

// ─── Package ───
export interface TreatmentPackage extends SoftDeletable {
  name: string;
  durationDays: number;
  cost: number;
}

// ─── Medicine ───
export interface Medicine extends SoftDeletable {
  name: string;
  price: number;
  active: boolean;
}

// ─── Enrollment ───
export interface Enrollment extends SoftDeletable {
  leadId: string;
  packageId: string;
  packageName: string;
  packageCost: number;
  packageDuration: number;
  startDate: string;
  endDate: string;
  amountPaid: number;
  medicineItems: BillMedicineItem[];
}

// ─── Bill ───
export interface BillMedicineItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPriceAtSale: number;
}

export interface Bill extends SoftDeletable {
  leadId: string;
  enrollmentId: string | null;
  rejoinId: string | null;
  packageAmount: number;
  amountPaid: number;
  medicineItems: BillMedicineItem[];
}

// ─── Rejoin ───
export interface Rejoin extends SoftDeletable {
  leadId: string;
  packageId: string;
  packageName: string;
  packageCost: number;
  packageDuration: number;
  startDate: string;
  endDate: string;
}

// ─── Lookups ───
export type LookupCategory = 'LeadSource' | 'LeadReason';

export interface LookupValue extends SoftDeletable {
  category: LookupCategory;
  code: string;
  displayName: string;
}

// ─── API DTOs ───

export interface FollowUpDto {
  id: string;
  followUpDate: string;
  notes: string;
  source: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export interface BillDto {
  id: string;
  packageAmount: number;
  advanceAmount: number;
  pendingAmount: number;
  medicineBillingAmount: number;
  createdAt: string;
  paymentHistoryJson: string;
}

export interface EnrollmentMedicineItem {
  medicineName: string;
  quantity: number;
  unitPriceAtSale: number;
}

export interface EnrollmentDetailDto {
  id: string;
  leadId: string;
  leadName: string;
  packageId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  packageCostSnapshot: number;
  packageDurationSnapshot: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  billId: string | null;
  
  // Flattened financial fields
  initialAmount: number;
  medicineBillingAmount: number;
  amountPaid: number;
  pendingAmount: number;
  paymentHistoryJson: string;

  medicineItems: EnrollmentMedicineItem[];
}

export interface EnrollmentDto {
  id: string;
  packageId: string;
  packageName: string;
  packageCostSnapshot: number;
  packageDurationSnapshot: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  bill: BillDto | null;
}

export interface RejoinRecordDto {
  id: string;
  packageId: string;
  packageName: string;
  packageCostSnapshot: number;
  packageDurationSnapshot: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  bill: BillDto | null;
}

export interface LeadDetail extends Lead {
  followUps: FollowUpDto[];
  enrollments: EnrollmentDto[];
  rejoinRecords: RejoinRecordDto[];
}

export interface LeadsParams {
  status?: LeadStatus | 'All';
  search?: string;
  source?: string | 'All';
  reason?: string | 'All';
  hasEnrollment?: boolean | 'All';
  hasMedicine?: boolean | 'All';
  pageNumber?: number;
  pageSize?: number;
}

export interface LeadsResponse {
  items: Lead[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
