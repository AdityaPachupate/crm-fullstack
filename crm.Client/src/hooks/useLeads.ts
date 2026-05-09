import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/api/leads.api';
import { Lead, LeadsParams, LeadsResponse } from '@/types';
import { toast } from 'sonner';
import { useLeadsStore } from '@/store/useLeadsStore';

export const LEADS_QUERY_KEY = ['leads'];

export function useLeads(params: LeadsParams = {}) {
  const { 
    search, 
    statusFilter, 
    sourceFilter, 
    reasonFilter, 
    hasEnrollmentFilter, 
    hasMedicineFilter 
  } = useLeadsStore();

  const rawStatus = params.status ?? statusFilter;
  const rawSource = params.source ?? sourceFilter;
  const rawReason = params.reason ?? reasonFilter;

  const activeParams: LeadsParams = {
    ...params,
    search: params.search ?? search,
    status: rawStatus === 'All' ? undefined : rawStatus,
    source: rawSource === 'All' ? undefined : rawSource,
    reason: rawReason === 'All' ? undefined : rawReason,
    hasEnrollment: hasEnrollmentFilter === 'All' ? undefined : hasEnrollmentFilter,
    hasMedicine: hasMedicineFilter === 'All' ? undefined : hasMedicineFilter,
  };

  const query = useQuery({
    queryKey: [...LEADS_QUERY_KEY, activeParams],
    queryFn: () => leadsApi.getAll(activeParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    leads: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    data: query.data
  };
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEY, id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => leadsApi.create(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error('This phone number is already registered to another lead');
      } else {
        toast.error(error.message || 'Failed to create lead');
      }
    }
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, lead }: { id: string; lead: Partial<Lead> }) => leadsApi.update(id, lead),
    onMutate: async ({ id, lead }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [...LEADS_QUERY_KEY, id] });

      // Snapshot the previous value
      const previousLead = queryClient.getQueryData<Lead>([...LEADS_QUERY_KEY, id]);

      // Optimistically update to the new value
      if (previousLead) {
        queryClient.setQueryData<Lead>([...LEADS_QUERY_KEY, id], {
          ...previousLead,
          ...lead,
        });
      }

      return { previousLead };
    },
    onError: (err: any, { id }, context) => {
      // If the mutation fails, use the context we returned above
      if (context?.previousLead) {
        queryClient.setQueryData([...LEADS_QUERY_KEY, id], context.previousLead);
      }
      toast.error(err.message || 'Failed to update lead');
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success to throw away optimistic update
      // and ensure the server state is truth
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LEADS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isPermanent }: { id: string; isPermanent?: boolean }) => leadsApi.delete(id, isPermanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete lead');
    }
  });
}

export function useRestoreLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => leadsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Lead restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to restore lead');
    }
  });
}

export function useBulkImportLeads() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => leadsApi.bulkImport(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      const { successCount, duplicateCount, errors } = data;
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} patients`);
      }
      
      if (duplicateCount > 0) {
        toast.info(`${duplicateCount} patients skipped (already exist)`);
      }
      
      if (errors && errors.length > 0) {
        toast.error(`Errors in ${errors.length} rows. Check CSV format.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import patients');
    }
  });
}
