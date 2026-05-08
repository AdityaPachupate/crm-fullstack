import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LookupValue, LookupCategory } from '@/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export const LOOKUPS_QUERY_KEY = ['lookups'];

export const lookupsApi = {
  getAll: async (includeDeleted = false): Promise<LookupValue[]> => {
    const data = await apiClient<any>(`/api/lookups?pageSize=200&includeDeleted=${includeDeleted}`);
    return data.items || [];
  },
  create: async (lookup: { category: LookupCategory; code: string; displayName: string }): Promise<LookupValue> => {
    return await apiClient<LookupValue>('/api/lookups', {
      method: 'POST',
      body: JSON.stringify(lookup)
    });
  },
  delete: async (id: string, isPermanent = false): Promise<void> => {
    await apiClient(`/api/lookups/${id}?isPermanent=${isPermanent}`, { method: 'DELETE' });
  },
  restore: async (id: string): Promise<void> => {
    await apiClient(`/api/lookups/${id}/restore`, { method: 'POST' });
  }
};

export function useLookups(includeDeleted = false) {
  return useQuery({
    queryKey: [...LOOKUPS_QUERY_KEY, includeDeleted],
    queryFn: () => lookupsApi.getAll(includeDeleted),
    staleTime: includeDeleted ? 0 : 60 * 60 * 1000, // Admin view should be fresh
  });
}

export function useLookupMutations(includeDeleted = false) {
  const queryClient = useQueryClient();
  const queryKey = [...LOOKUPS_QUERY_KEY, includeDeleted];

  const deleteMutation = useMutation({
    mutationFn: ({ id, isPermanent = false }: { id: string, isPermanent?: boolean }) => lookupsApi.delete(id, isPermanent),
    onMutate: async ({ id, isPermanent }) => {
      if (!isPermanent) {
        await queryClient.cancelQueries({ queryKey });
        const previousLookups = queryClient.getQueryData<LookupValue[]>(queryKey);
        
        queryClient.setQueryData<LookupValue[]>(queryKey, (old) => 
          old?.map(l => l.id === id ? { ...l, deletedAt: new Date().toISOString() } : l)
        );

        return { previousLookups };
      }
      return {};
    },
    onError: (err, variables, context) => {
      if (context?.previousLookups) {
        queryClient.setQueryData(queryKey, context.previousLookups);
      }
      toast.error('Failed to deactivate lookup value');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LOOKUPS_QUERY_KEY });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: lookupsApi.restore,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousLookups = queryClient.getQueryData<LookupValue[]>(queryKey);
      
      queryClient.setQueryData<LookupValue[]>(queryKey, (old) => 
        old?.map(l => l.id === id ? { ...l, deletedAt: null } : l)
      );

      return { previousLookups };
    },
    onError: (err, id, context) => {
      if (context?.previousLookups) {
        queryClient.setQueryData(queryKey, context.previousLookups);
      }
      toast.error('Failed to restore lookup value');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LOOKUPS_QUERY_KEY });
    }
  });

  const addMutation = useMutation({
    mutationFn: lookupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOOKUPS_QUERY_KEY });
    },
    onError: () => toast.error('Failed to add lookup value')
  });

  return {
    addLookup: addMutation.mutateAsync,
    deleteLookup: deleteMutation.mutateAsync,
    restoreLookup: restoreMutation.mutateAsync,
    isPending: addMutation.isPending || deleteMutation.isPending || restoreMutation.isPending
  };
}
