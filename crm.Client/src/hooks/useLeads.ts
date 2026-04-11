import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/api/leads.api';
import { Lead, LeadsParams, LeadsResponse } from '@/types';
import { toast } from 'sonner';

export const LEADS_QUERY_KEY = ['leads'];

export function useLeads(params: LeadsParams = {}) {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEY, params],
    queryFn: () => leadsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete lead');
    }
  });
}
