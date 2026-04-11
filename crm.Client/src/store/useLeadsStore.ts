import { create } from 'zustand';
import { LeadStatus } from '@/types';

interface LeadsState {
  search: string;
  statusFilter: LeadStatus | 'All';
  sourceFilter: string | 'All';
  reasonFilter: string | 'All';
  hasEnrollmentFilter: boolean | 'All';
  hasMedicineFilter: boolean | 'All';
  setSearch: (search: string) => void;
  setStatusFilter: (status: LeadStatus | 'All') => void;
  setSourceFilter: (source: string | 'All') => void;
  setReasonFilter: (reason: string | 'All') => void;
  setHasEnrollmentFilter: (has: boolean | 'All') => void;
  setHasMedicineFilter: (has: boolean | 'All') => void;
  resetFilters: () => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  search: '',
  statusFilter: 'All',
  sourceFilter: 'All',
  reasonFilter: 'All',
  hasEnrollmentFilter: 'All',
  hasMedicineFilter: 'All',
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  setReasonFilter: (reasonFilter) => set({ reasonFilter }),
  setHasEnrollmentFilter: (hasEnrollmentFilter) => set({ hasEnrollmentFilter }),
  setHasMedicineFilter: (hasMedicineFilter) => set({ hasMedicineFilter }),
  resetFilters: () => set({ 
    search: '', 
    statusFilter: 'All', 
    sourceFilter: 'All', 
    reasonFilter: 'All', 
    hasEnrollmentFilter: 'All', 
    hasMedicineFilter: 'All' 
  }),
}));
