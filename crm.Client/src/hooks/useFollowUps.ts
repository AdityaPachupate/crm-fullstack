import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsApi, CompleteFollowUpRequest } from '@/api/followups.api';
import { toast } from 'sonner';
import { LEADS_QUERY_KEY } from './useLeads';

export const FOLLOWUPS_QUERY_KEY = ['followups'];

export function useFollowUpsToday() {
  return useQuery({
    queryKey: [...FOLLOWUPS_QUERY_KEY, 'today'],
    queryFn: () => followupsApi.getAllToday(),
  });
}

export function useFollowUpsList(params?: { 
  status?: string; 
  startDate?: string; 
  endDate?: string; 
  leadId?: string;
  isTrash?: boolean;
}) {
  return useQuery({
    queryKey: [...FOLLOWUPS_QUERY_KEY, 'list', params],
    queryFn: () => followupsApi.getAll(params),
  });
}

export function useFollowUps() {
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CompleteFollowUpRequest }) => 
      followupsApi.complete(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Follow-up marked as complete');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete follow-up');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => followupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Follow-up moved to trash');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete follow-up');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => followupsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Follow-up restored');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to restore follow-up');
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => followupsApi.delete(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      toast.success('Follow-up permanently deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to permanently delete follow-up');
    }
  });

  return {
    completeFollowUp: completeMutation,
    deleteFollowUp: deleteMutation,
    restoreFollowUp: restoreMutation,
    permanentDeleteFollowUp: permanentDeleteMutation,
    isCompleting: completeMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isPermanentlyDeleting: permanentDeleteMutation.isPending
  };
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => followupsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLLOWUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Follow-up scheduled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule follow-up');
    }
  });
}

// Named exports for compatibility with older code
export const useCompleteFollowUp = () => useFollowUps().completeFollowUp;
export const useDeleteFollowUp = () => useFollowUps().deleteFollowUp;
