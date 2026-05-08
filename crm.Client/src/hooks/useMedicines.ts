import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicinesApi } from '@/api/medicines.api';
import { toast } from 'sonner';

export const MEDICINES_QUERY_KEY = ['medicines'];

export function useMedicines(isTrash: boolean = false) {
  return useQuery({
    queryKey: [...MEDICINES_QUERY_KEY, { isTrash }],
    queryFn: () => medicinesApi.getAll(isTrash),
  });
}

export function useMedicineMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: medicinesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
      toast.success('Medicine added successfully');
    },
    onError: () => toast.error('Failed to add medicine'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, medicine }: { id: string; medicine: any }) => medicinesApi.update(id, medicine),
    onMutate: async ({ id, medicine }) => {
      await queryClient.cancelQueries({ queryKey: MEDICINES_QUERY_KEY });
      const previousMedicines = queryClient.getQueryData(MEDICINES_QUERY_KEY);

      queryClient.setQueriesData({ queryKey: MEDICINES_QUERY_KEY }, (old: any) => {
        if (!old) return old;
        // If it's a list (GetMedicines)
        if (Array.isArray(old)) {
          return old.map((m: any) => m.id === id ? { ...m, ...medicine } : m);
        }
        // If it's a single object (GetMedicineById)
        if (old.id === id) {
          return { ...old, ...medicine };
        }
        return old;
      });

      return { previousMedicines };
    },
    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: MEDICINES_QUERY_KEY }, context?.previousMedicines);
      toast.error('Failed to update medicine');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
    },
    onSuccess: () => {
      toast.success('Medicine updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, isPermanent }: { id: string; isPermanent?: boolean }) => medicinesApi.delete(id, isPermanent),
    onSuccess: (_, { isPermanent }) => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
      toast.success(isPermanent ? 'Medicine permanently deleted' : 'Medicine moved to trash');
    },
    onError: () => toast.error('Failed to delete medicine'),
  });

  const restoreMutation = useMutation({
    mutationFn: medicinesApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
      toast.success('Medicine restored successfully');
    },
    onError: () => toast.error('Failed to restore medicine'),
  });

  return {
    createMedicine: createMutation,
    updateMedicine: updateMutation,
    deleteMedicine: deleteMutation,
    restoreMedicine: restoreMutation,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || restoreMutation.isPending,
  };
}
