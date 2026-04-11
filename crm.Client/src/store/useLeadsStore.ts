import { create } from 'zustand';
import { LeadStatus } from '@/types';

interface LeadsState {
  search: string;
  statusFilter: LeadStatus | 'All';
  setSearch: (search: string) => void;
  setStatusFilter: (status: LeadStatus | 'All') => void;
  resetFilters: () => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  search: '',
  statusFilter: 'All',
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  resetFilters: () => set({ search: '', statusFilter: 'All' }),
}));
