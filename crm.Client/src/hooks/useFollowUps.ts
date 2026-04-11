import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsApi, CreateFollowUpRequest, CompleteFollowUpRequest } from '@/api/followups.api';
import { toast } from 'sonner';
import { LEADS_QUERY_KEY } from './useLeads';

export const FOLLOWUPS_QUERY_KEY = ['followups'];

export function useFollowUpsToday() {
  return useQuery({
    queryKey: [...FOLLOWUPS_QUERY_KEY, 'today'],
    queryFn: () => followupsApi.getAllToday(),
    staleTime: 1 * 60 * 1000, // 1 minute (follow-ups are time-sensitive)
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateFollowUpRequest) => followupsApi.create(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...LEADS_QUERY_KEY, variables.leadId] });
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule follow-up');
    }
  });
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CompleteFollowUpRequest }) => 
      followupsApi.complete(id, request),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: [...FOLLOWUPS_QUERY_KEY, 'today'] });
      const previousFollowups = queryClient.getQueryData<any[]>([...FOLLOWUPS_QUERY_KEY, 'today']);
      
      // Optimistically remove the follow-up from the today's list
      if (previousFollowups) {
        queryClient.setQueryData([...FOLLOWUPS_QUERY_KEY, 'today'], 
          previousFollowups.filter(f => f.id !== id)
        );
      }
      
      return { previousFollowups };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousFollowups) {
        queryClient.setQueryData([...FOLLOWUPS_QUERY_KEY, 'today'], context.previousFollowups);
      }
      toast.error(error.message || 'Failed to complete follow-up');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    }
  });
}

export function useDeleteFollowUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => followupsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [...FOLLOWUPS_QUERY_KEY, 'today'] });
      const previousFollowups = queryClient.getQueryData<any[]>([...FOLLOWUPS_QUERY_KEY, 'today']);
      
      if (previousFollowups) {
        queryClient.setQueryData([...FOLLOWUPS_QUERY_KEY, 'today'], 
          previousFollowups.filter(f => f.id !== id)
        );
      }
      
      return { previousFollowups };
    },
    onError: (error: any, _id, context) => {
      if (context?.previousFollowups) {
        queryClient.setQueryData([...FOLLOWUPS_QUERY_KEY, 'today'], context.previousFollowups);
      }
      toast.error(error.message || 'Failed to delete follow-up');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
    }
  });
}
