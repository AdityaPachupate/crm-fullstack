import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rejoinsApi, CreateRejoinRequest, UpdateRejoinRequest, GetRejoinsParams } from '@/api/rejoins.api';
import { LEADS_QUERY_KEY } from './useLeads';
import { BILLS_QUERY_KEY } from './useBills';
import { toast } from 'sonner';

export const REJOINS_QUERY_KEY = ['rejoins'];

export function useRejoin(id: string) {
  return useQuery({
    queryKey: [...REJOINS_QUERY_KEY, id],
    queryFn: () => rejoinsApi.getById(id),
    enabled: !!id,
  });
}

export function useRejoins(params?: GetRejoinsParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: params ? [...REJOINS_QUERY_KEY, params] : REJOINS_QUERY_KEY,
    queryFn: () => rejoinsApi.getAll(params),
  });

  const createRejoin = useMutation({
    mutationFn: (request: CreateRejoinRequest) => rejoinsApi.create(request),
    onSuccess: () => {
      // Small delay to ensure DB transaction is committed
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: REJOINS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }, 500);
      toast.success('Rejoin created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create rejoin');
    }
  });

  const updateRejoin = useMutation({
    mutationFn: (request: UpdateRejoinRequest) => rejoinsApi.update(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REJOINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: [...LEADS_QUERY_KEY, variables.leadId] });
      }
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Rejoin updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update rejoin');
    }
  });

  const deleteRejoin = useMutation({
    mutationFn: ({ id, isPermanent }: { id: string, isPermanent?: boolean }) => rejoinsApi.delete(id, isPermanent),
    onSuccess: () => {
      // Small delay to ensure DB transaction is committed
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: REJOINS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }, 500);
      toast.success('Rejoin deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete rejoin');
    }
  });

  const restoreRejoin = useMutation({
    mutationFn: (id: string) => rejoinsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REJOINS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Rejoin restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to restore rejoin');
    }
  });

  return {
    ...query,
    createRejoin,
    updateRejoin,
    deleteRejoin,
    restoreRejoin,
  };
}
