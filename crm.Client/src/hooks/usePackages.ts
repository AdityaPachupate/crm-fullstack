import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi } from '@/api/packages.api';
import { toast } from 'sonner';

export const PACKAGES_QUERY_KEY = ['packages'];

export function usePackages(isTrash: boolean = false) {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, { isTrash }],
    queryFn: () => packagesApi.getAll(isTrash),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
  });
}

export function usePackageMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: packagesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
      toast.success('Package added successfully');
    },
    onError: () => toast.error('Failed to add package'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, pkg }: { id: string; pkg: any }) => packagesApi.update(id, pkg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
      toast.success('Package updated successfully');
    },
    onError: () => toast.error('Failed to update package'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, isPermanent }: { id: string; isPermanent?: boolean }) => packagesApi.delete(id, isPermanent),
    onSuccess: (_, { isPermanent }) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
      toast.success(isPermanent ? 'Package permanently deleted' : 'Package moved to trash');
    },
    onError: () => toast.error('Failed to delete package'),
  });

  const restoreMutation = useMutation({
    mutationFn: packagesApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
      toast.success('Package restored successfully');
    },
    onError: () => toast.error('Failed to restore package'),
  });

  return {
    createPackage: createMutation,
    updatePackage: updateMutation,
    deletePackage: deleteMutation,
    restorePackage: restoreMutation,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || restoreMutation.isPending,
  };
}
